// lib/actions.ts
'use server';

import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from "@/lib/prisma";
import { AuthError } from 'next-auth';
import { signIn } from '@/auth';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { v2 as cloudinary } from 'cloudinary';
import { generateReviewKeywords } from '@/lib/search-action';
import { sendApprovalEmail, sendRejectionEmail } from "@/lib/mail";
import { v4 as uuidv4 } from "uuid";
import { sendDomainVerificationEmail } from "@/lib/mail";
import { sendProfessionalCampaign } from '@/lib/mail';
import crypto from "crypto";
import { checkEmailLimit, incrementEmailUsage } from "@/lib/usage-limit"; 

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Define the Zod Schema for validation
const RegisterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});


// --- HELPER: CALCULATE BAYESIAN SCORE ---
async function updateCompanyRating(companyId: string) {
  const C = 3.5; // Global Average Baseline
  const m = 7;   // Confidence Weight (Virtual Reviews)

  // 1. Fetch all reviews for this company
  const reviews = await prisma.review.findMany({
    where: { companyId },
    select: { starRating: true }
  });

  const N = reviews.length;
  
  if (N === 0) {
    // No reviews? Reset to 0 (or baseline if you prefer)
    await prisma.company.update({
      where: { id: companyId },
      data: { rating: 0, reviewCount: 0 }
    });
    return;
  }

  // 2. Calculate Sum of Ratings
  const sumR = reviews.reduce((acc, r) => acc + r.starRating, 0);

  // 3. Bayesian Formula: (C*m + SumR) / (m + N)
  const bayesianScore = ((C * m) + sumR) / (m + N);

  // 4. Update Company Record
  await prisma.company.update({
    where: { id: companyId },
    data: { 
      rating: bayesianScore,
      reviewCount: N
    }
  });
}


export async function authenticate(prevState: any, formData: FormData) {
  try {
    // 1. Capture the redirect URL (defaults to dashboard if missing)
    const redirectTo = formData.get('redirectTo') as string || '/dashboard';
    
    // 2. Attempt to sign in
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo, // <--- Important: This sends user to /admin or /dashboard correctly
    });
    
  } catch (error) {
    // 3. Handle specific NextAuth errors
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    // 4. Re-throw the redirect error (Next.js needs this to actually redirect)
    throw error;
  }
}

export async function registerUser(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // 1. Validate Fields
  const validatedFields = RegisterSchema.safeParse({ name, email, password });

  if (!validatedFields.success) {
    return { error: validatedFields.error.message };
  }

  try {
    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'Email already in use. Please login.' };
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create User in DB
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        image: `https://ui-avatars.com/api/?name=${name}&background=random`, // Generate a default avatar
      },
    });

    // 5. Redirect or Login (We won't return here, signIn throws a redirect error which Next.js handles)
    // For now, let's return success so the UI can redirect to login
    return { success: true };

  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

// --- 3. GOOGLE LOGIN ACTION ---
export async function socialLogin(formData: FormData) {
  const action = formData.get('action') as string;
  // Ensure this line is exactly as follows:
  const redirectTo = formData.get('redirectTo') as string || '/dashboard';
  
  await signIn(action, { redirectTo });
}


// --- 1. REVIEW ACTION ---
export async function createReview(prevState: any, formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return { error: "You must be logged in to write a review." };

  const companyId = formData.get('companyId') as string;
  const companySlug = formData.get('companySlug') as string;
  const rating = parseFloat(formData.get('rating') as string);
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const dateString = formData.get('date') as string;
  const imageFiles = formData.getAll('images') as File[];

  if (!rating || rating < 1 || rating > 5) return { error: "Please select a rating." };
  
  try {
    // --- Image Upload Logic (Unchanged) ---
    const uploadedImageUrls: string[] = [];
    if (imageFiles && imageFiles.length > 0) {
      const uploadPromises = imageFiles.map(async (file) => {
        if (file.size > 0) {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          return new Promise<string>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              { folder: "review_images",
                transformation: [{ width: 800, crop: "limit", quality: "auto", fetch_format: "auto" }]
               },
              (error, result) => {
                if (error) reject(error);
                else resolve(result!.secure_url);
              }
            ).end(buffer);
          });
        }
        return null;
      });
      const results = await Promise.all(uploadPromises);
      results.forEach(url => { if (url) uploadedImageUrls.push(url) });
    }

    // ✅ 1. Generate Smart Keywords (Now returns { topic, sentiment, snippet })
    const rawAiKeywords = await generateReviewKeywords(content);

    // ✅ 2. Format as Strings for Database
    const formattedKeywords = rawAiKeywords.map((k: any) => 
      `${k.topic}:${k.sentiment}:${k.snippet}`
    );

    // 3. Save to Database
    await prisma.review.create({
      data: {
        starRating: rating,
        reviewTitle: title,
        comment: content,
        dateOfExperience: dateString ? new Date(dateString) : new Date(),
        companyId: companyId,
        userId: userId,
        relatedImages: uploadedImageUrls, 
        keywords: formattedKeywords, // Uses the new triple format
      },
    });

    await updateCompanyRating(companyId);

    revalidatePath(`/company/${companySlug}`);
    revalidatePath('/dashboard');

    return { success: true };

  } catch (error) {
    console.error("Review submission error:", error);
    return { error: "Failed to submit review. Please try again." };
  }
}

// --- 5. EDIT REVIEW ACTION ---
export async function updateReview(prevState: any, formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return { error: "Unauthorized" };

  const reviewId = formData.get('reviewId') as string;
  const companySlug = formData.get('companySlug') as string;
  const rating = parseFloat(formData.get('rating') as string);
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  
  // 1. Get the date
  const dateString = formData.get('date') as string;

  if (!rating || rating < 1 || rating > 5) return { error: "Invalid rating." };
  if (!title || !content) return { error: "Fields cannot be empty." };

  try {
    await prisma.review.update({
      where: { 
        id: reviewId,
        userId: userId 
      },
      data: {
        starRating: rating,
        reviewTitle: title,
        comment: content,
        dateOfExperience: dateString ? new Date(dateString) : undefined,
        isFlagged: false,   
        adminMessage: null,
      },
    });

    // --- NEW: SEND CONFIRMATION TO ADMIN ---
    // Find any open reports linked to this review that were waiting for an edit
    const relatedReports = await prisma.report.findMany({
        where: { 
            reviewId: reviewId,
            status: "WAITING_FOR_EDIT" // Only update the ones waiting on us
        }
    });

    // Update them to "EDITED" so Admin sees the green status
    if (relatedReports.length > 0) {
        await prisma.report.updateMany({
            where: { reviewId: reviewId, status: "WAITING_FOR_EDIT" },
            data: { status: "RESOLVED" } // <--- This is your confirmation signal
        });
    }

    const review = await prisma.review.findUnique({ 
        where: { id: reviewId },
        select: { companyId: true } 
    });
    
    if (review) {
        await updateCompanyRating(review.companyId);
    }

    revalidatePath('/dashboard');
    revalidatePath(`/company/${companySlug}`);
    revalidatePath('/admin/reports');
    return { success: true };

  } catch (error) {
    return { error: "Failed to update review." };
  }
}

// --- 6. DELETE REVIEW ACTION ---
export async function deleteReviewAction(reviewId: string, companySlug: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) throw new Error("Unauthorized");

  try {
    // 1. Delete the review AND return the companyId
    const deletedReview = await prisma.review.delete({
      where: {
        id: reviewId,
        userId: userId, 
      },
      select: { companyId: true } // <--- IMPORTANT: Get the ID back
    });

    // 2. Recalculate score for that company
    if (deletedReview) {
        await updateCompanyRating(deletedReview.companyId);
    }

    revalidatePath('/dashboard');
    revalidatePath(`/company/${companySlug}`);
    return { success: true };
  } catch (error) {
    throw new Error("Failed to delete review");
  }
}

// --- 7. UPDATE USER PROFILE ACTION ---
export async function updateUserProfile(prevState: any, formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return { error: "Unauthorized" };

  const name = formData.get('name') as string;
  const country = formData.get('country') as string;
  const gender = formData.get('gender') as string;
  const imageFile = formData.get('image') as File;

  if (!name || name.trim().length < 2) {
    return { error: "Name must be at least 2 characters." };
  }

  try {
    let imageUrl = undefined;

    // 1. Handle Image Upload if a file exists and has size
    if (imageFile && imageFile.size > 0) {
      // Convert file to buffer
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Cloudinary via Promise
      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "user_avatars", transformation: [{ width: 400, height: 400, crop: "fill",quality: "auto", fetch_format: "auto" }] },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      imageUrl = uploadResult.secure_url;
    }

    // 2. Update Database
    await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        country,
        gender,
        // Only update image if a new one was uploaded
        ...(imageUrl && { image: imageUrl }),
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/settings');
    return { success: true };

  } catch (error) {
    console.error("Profile update error:", error);
    return { error: "Failed to update profile. Please try again." };
  }
}

// --- 9. REPORT REVIEW ---
export async function reportReview(reviewId: string, reason: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return { error: "You must be logged in." };

  try {
    await prisma.report.create({
      data: {
        userId,
        reviewId,
        reason,
        status: "PENDING",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Report Error:", error);
    return { error: "Failed to submit report." };
  }
}

// --- 8. TOGGLE HELPFUL VOTE ---
export async function toggleHelpful(reviewId: string, currentPath: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return { error: "You must be logged in." };

  try {
    // Check if the user already voted on this review
    const existingVote = await prisma.helpfulVote.findUnique({
      where: {
        userId_reviewId: {
          userId,
          reviewId,
        },
      },
    });

    if (existingVote) {
      // If exists, remove it (Toggle OFF)
      await prisma.helpfulVote.delete({
        where: { id: existingVote.id },
      });
    } else {
      // If not, create it (Toggle ON)
      await prisma.helpfulVote.create({
        data: {
          userId,
          reviewId,
        },
      });
    }

    // Refresh the page to show the new count instantly
    revalidatePath(currentPath);
    
    // Also refresh the dashboard
    revalidatePath('/dashboard'); 

    return { success: true };
  } catch (error) {
    console.error("Toggle Helpful Error:", error);
    return { error: "Failed to register vote." };
  }
}


// --- 10. INCREMENT REVIEW READS (Robust Version) ---
export async function incrementReviewReads(reviewIds: string[]) {
  if (!reviewIds.length) return;

  console.log("🚀 Starting read increment for:", reviewIds);

  try {
    // Fetch current values first to debug
    const reviews = await prisma.review.findMany({
      where: { id: { in: reviewIds } },
      select: { id: true, reads: true }
    });

    console.log("📊 Current Reads before update:", reviews);

    // Update each one individually to ensure it works
    for (const r of reviews) {
      const currentReads = r.reads || 0; // Force 0 if null
      
      await prisma.review.update({
        where: { id: r.id },
        data: { reads: currentReads + 1 }
      });
    }
    
    console.log("✅ Successfully incremented reads for", reviews.length, "reviews.");

  } catch (error) {
    console.error("❌ Failed to track views", error);
  }
}

// --- INCREMENT COMPANY VIEW (Robust Version) ---
export async function incrementCompanyView(companyId: string) {
  if (!companyId) return;

  try {
    // 1. Fetch the current company to see what the DB actually holds
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, views: true, name: true }
    });

    if (!company) {
      console.error("❌ Company not found for ID:", companyId);
      return;
    }

    console.log(`🔍 Found Company: ${company.name}`);
    console.log(`📊 Current Views in DB: ${company.views} (Type: ${typeof company.views})`);

    // 2. Calculate the new value safely
    // If null/undefined, start at 0. Ensure it's treated as a Number.
    const currentCount = company.views ? Number(company.views) : 0;
    const newCount = currentCount + 1;

    console.log(`🔄 Attempting to update to: ${newCount}`);

    // 3. Explicitly SET the new value (bypassing atomic increment)
    const result = await prisma.company.update({
      where: { id: companyId },
      data: { 
        views: newCount 
      }
    });

    console.log(`✅ Update successful. New DB Value: ${result.views}`);

  } catch (error) {
    console.error("❌ Failed to track view manually:", error);
  }
}

// --- ADMIN ACTIONS ---

export async function adminDeleteReview(reviewId: string) {
  // In production: Check session.user.role === 'ADMIN'
  try {
    await prisma.review.delete({ where: { id: reviewId } });
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete review" };
  }
}

export async function adminDeleteCompany(companyId: string) {
  try {
    // Reviews are deleted automatically via Cascade, but good to be explicit if needed
    await prisma.company.delete({ where: { id: companyId } });
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete company" };
  }
}


export async function upsertCompany(prevState: any, formData: FormData) {
  const session = await auth();
  
  // @ts-ignore
  const userRole = session?.user?.role;
  if (userRole !== 'ADMIN' && userRole !== 'DATA_ENTRY') {
      return { error: "Unauthorized" };
  }
  // @ts-ignore
  const userId = session?.user?.id;

  const companyId = formData.get('companyId') as string;

  // ✅ 1. FETCH EXISTING DATA (CRUCIAL STEP)
  // We need this to fallback to old values if the form doesn't send them.
  let existingCompany: any = null;
  if (companyId) {
    existingCompany = await prisma.company.findUnique({ where: { id: companyId } });
    if (!existingCompany) return { error: "Company not found." };
  }

  // ✅ 2. HELPER: Get Value Safe
  // Logic: If the form has the key, use it. If not, KEEP the database value.
  const getVal = (key: string) => {
    if (formData.has(key)) return formData.get(key) as string;
    // If field is missing from form, return existing DB value (or empty string if new)
    return existingCompany ? existingCompany[key] : "";
  };

  // --- EXTRACT BASIC FIELDS ---
  const name = getVal('name');
  const website = getVal('websiteUrl') || getVal('website'); 
  const categoryId = getVal('categoryId');
  const subCategoryId = getVal('subCategoryId');
  const description = getVal('briefIntroduction') || getVal('description'); 
  
  // --- LOCATION FIELDS (Fixes "City/Country Changed" issue) ---
  const city = getVal('city');
  const country = getVal('country');
  const state = getVal('state');
  const subCity = getVal('subCity');
  const address = getVal('address');
  
  const companyType = getVal('companyType') as 'SERVICE' | 'PRODUCT'; 
  
  // --- RESTRICTED FIELDS ---
  // If user is ADMIN, trust the form. If DATA_ENTRY, keep existing values.
  let claimed = existingCompany?.claimed || false;
  let domainVerified = existingCompany?.domainVerified || null;

  if (userRole === 'ADMIN') {
      if (formData.has('claimed')) claimed = formData.get('claimed') === 'on';
      if (formData.has('domainVerified')) {
          domainVerified = formData.get('domainVerified') === 'on' ? new Date() : null;
      }
  }

  // --- KEYWORDS ---
  const keywordsInput = formData.get('keywords') as string;
  let keywords = existingCompany?.keywords || [name.toLowerCase()];
  if (formData.has('keywords')) {
      keywords = keywordsInput
        ? keywordsInput.split(',').map((k) => k.trim().toLowerCase()).filter(Boolean)
        : [];
  }

  // --- IMAGE HANDLING (Fixes "Logo Removed" issue) ---
  const logoFile = formData.get('logo') as File;
  const otherImageFiles = formData.getAll('otherImages') as File[]; 
  
  // Gallery Logic
  const retainedImagesJson = formData.get('retainedImages') as string;
  let retainedImages: string[] = [];
  if (retainedImagesJson) {
      try { retainedImages = JSON.parse(retainedImagesJson); } catch (e) {}
  } else if (existingCompany) {
      retainedImages = existingCompany.otherImages || []; // Keep existing if not touched
  }

  if (!name || !categoryId) return { error: "Name and Category are required." };

  try {
    // ✅ LOGO LOGIC FIX:
    // 1. Default to existing logo.
    // 2. If new file uploaded, overwrite it.
    let logoUrl = existingCompany?.logoImage; 

    if (logoFile && logoFile.size > 0) {
      const arrayBuffer = await logoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "company_logos", transformation: [{ width: 200, height: 200, crop: "fill" }] },
          (error, result) => (error ? reject(error) : resolve(result))
        ).end(buffer);
      });
      logoUrl = uploadResult.secure_url;
    }

    // Upload Gallery
    const newImageUrls: string[] = [];
    if (otherImageFiles.length > 0) {
      const uploadPromises = otherImageFiles.map(async (file) => {
        if (file.size > 0) {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          return new Promise<string>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              { folder: "company_showcase", transformation: [{ width: 1200, crop: "limit" }] },
              (error, result) => (error ? reject(error) : resolve(result!.secure_url))
            ).end(buffer);
          });
        }
        return null;
      });
      const results = await Promise.all(uploadPromises);
      results.forEach(url => { if(url) newImageUrls.push(url) });
    }

    const finalGalleryImages = [...retainedImages, ...newImageUrls];

    // --- CONSTRUCT FULL PAYLOAD ---
    const dataPayload: any = {
      name,
      websiteUrl: website,
      categoryId,
      subCategoryId, 
      briefIntroduction: description,
      city,
      country,
      state,
      subCity,
      address,
      companyType,
      claimed,
      domainVerified,
      keywords,
      otherImages: finalGalleryImages,
      logoImage: logoUrl, // ✅ Now correctly holds old logo if no new one
      
      // ✅ HIDDEN FIELDS MERGE (Fixes Email/Phone empty issue)
      // We explicitly copy these from existingCompany because your form likely doesn't have inputs for them
      contactEmail: getVal('contactEmail') || existingCompany?.contactEmail,
      phone: getVal('phone') || existingCompany?.phone,
      foundedYear: getVal('foundedYear') || existingCompany?.foundedYear,
      metaTitle: getVal('metaTitle') || existingCompany?.metaTitle,
      metaDescription: getVal('metaDescription') || existingCompany?.metaDescription,
      socialLinks: existingCompany?.socialLinks || {}, 
      createdAt: existingCompany?.createdAt
    };

    // Sub-Category Auto-Assign (Create only)
    if (!companyId && !dataPayload.subCategoryId) {
         const category = await prisma.category.findUnique({
            where: { id: categoryId },
            include: { subCategories: true }
         });
         if (category && category.subCategories.length > 0) {
             dataPayload.subCategoryId = category.subCategories[0].id;
         }
    }

    // Slug Auto-Assign (Create only)
    if (!companyId) {
        dataPayload.slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    }

    // --- SAVE TO PENDING CHANGES (Data Entry) ---
    if (userRole === 'DATA_ENTRY') {
        await prisma.pendingChange.create({
            data: {
                model: "COMPANY",
                action: companyId ? "UPDATE" : "CREATE",
                targetId: companyId || null,
                data: dataPayload, // ✅ Payload is now complete with merged data
                requesterId: userId as string,
                status: "PENDING"
            }
        });
        
        revalidatePath('/data-entry/companies');
        return { success: true, message: "Request submitted for Admin Approval." };
    }

    // --- DIRECT EXECUTION (Admin) ---
    if (companyId) {
      await prisma.company.update({
        where: { id: companyId },
        data: dataPayload,
      });
    } else {
      await prisma.company.create({
        data: dataPayload
      });
    }

    revalidatePath('/admin/companies');
    revalidatePath('/data-entry/companies');

    return { success: true };

  } catch (error) {
    console.error("Upsert Error:", error);
    return { error: "Failed to save company." };
  }
}

// --- 14. ADMIN: UPDATE BADGES ---
export async function updateCompanyBadges(companyId: string, badges: string[]) {
  try {
    // 1. Check if we are trying to add the "MOST_RELEVANT" badge
    const isAddingMostRelevant = badges.includes("MOST_RELEVANT");

    if (isAddingMostRelevant) {
      // 2. Fetch the company to identify its Category/Sub-Category
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { 
          categoryId: true, 
          subCategoryId: true, 
          badges: true, 
          name: true 
        } 
      });

      if (!company) return { error: "Company not found" };

      // 3. Check if it ALREADY has the badge
      // If the company already has "Most Relevant", we are just editing other badges.
      // We skip the validation so we don't block ourselves.
      const alreadyHasIt = company.badges.includes("MOST_RELEVANT");

      if (!alreadyHasIt) {
        // 4. Build the Filter
        // We want to count OTHER companies in the SAME group that HAVE the badge.
        const whereClause: any = {
           badges: { has: "MOST_RELEVANT" }, // Look for badge in array
           id: { not: companyId }            // Exclude self
        };

        // 5. Determine Scope
        // If it's in a Sub-Category, we limit based on that Sub-Category.
        // Otherwise, we limit based on the Main Category.
        let scopeName = "Main Category";
        
        if (company.subCategoryId) {
           whereClause.subCategoryId = company.subCategoryId;
           scopeName = "Sub-Category";
        } else {
           whereClause.categoryId = company.categoryId;
        }

        // 6. Count existing badges in that scope
        const count = await prisma.company.count({ where: whereClause });

        // 7. Validation Rule: Max 5
        if (count >= 5) {
          return { 
            error: `Limit Reached: 5 companies in this ${scopeName} already have "Most Relevant". Remove the badge from another company first.` 
          };
        }
      }
    }

    // 8. If validation passed, Save Updates
    await prisma.company.update({
      where: { id: companyId },
      data: { badges }
    });

    // 9. Refresh pages so the new badge shows up immediately
    revalidatePath("/admin/companies");
    revalidatePath("/categories"); 
    
    return { success: true };

  } catch (error) {
    console.error("Failed to update badges:", error);
    return { error: "Database error occurred." };
  }
}

// --- 15. ADMIN: RESOLVE REPORT ---
export async function resolveReport(
  reportId: string, 
  reviewId: string, 
  action: 'DELETE' | 'KEEP' | 'WARN', 
  adminNote: string
) {
  console.log("🚀 START: resolveReport called with:", { reportId, action, adminNote }); // DEBUG LOG

  const session = await auth();
  if (session?.user?.role !== 'ADMIN') return { error: "Unauthorized" };

  try {
    const report = await prisma.report.findUnique({ 
        where: { id: reportId },
        include: { review: { include: { user: true } }, user: true }
    });

    if (!report) {
        console.error("❌ ERROR: Report not found in DB"); // DEBUG LOG
        return { error: "Report not found" };
    }
    
    const reviewAuthorId = report.review?.userId;
    console.log("👤 Review Author ID found:", reviewAuthorId); // DEBUG LOG

    // --- 1. DEFINE MESSAGES ---
    let authorMessage = adminNote;
    if (!authorMessage) {
        if (action === 'WARN') authorMessage = "Your review has been flagged. Please check the dashboard and edit it to comply with our community guidelines.";
        if (action === 'DELETE') authorMessage = "Your review was removed because it violated our community guidelines.";
        if (action === 'KEEP') authorMessage = "No action needed."; 
    }

    let reporterMessage = "";
    if (action === 'WARN') {
        reporterMessage = "We have reviewed your report and requested the author to edit their content.";
    } else if (action === 'DELETE') {
        reporterMessage = "We have removed the content that violated our policies. Thank you for reporting.";
    } else {
        reporterMessage = "We investigated your report and found the content does not violate our current guidelines.";
    }

    // --- 2. DETERMINE NEW STATUS ---
    let newStatus = "RESOLVED"; 
    if (action === 'WARN') {
        newStatus = "WAITING_FOR_EDIT"; 
    }

    // --- 3. HANDLE REVIEW MODIFICATION ---
    if (action === 'DELETE' && reviewId) {
        await prisma.review.delete({ where: { id: reviewId } });
        console.log("🗑️ Review deleted");
    }

    if (action === 'WARN' && reviewId) {
        await prisma.review.update({
            where: { id: reviewId },
            data: { isFlagged: true, adminMessage: authorMessage } 
        });
        console.log("🚩 Review Flagged successfully");
    }

    // --- 4. NOTIFY AUTHOR ---
    if (reviewAuthorId && action !== 'KEEP') {
        console.log("🔔 Attempting to create notification for:", reviewAuthorId); // DEBUG LOG
        
        try {
            await prisma.notification.create({
                data: {
                    userId: reviewAuthorId,
                    type: 'ALERT',
                    title: action === 'DELETE' ? 'Your Review was Removed' : 'Action Required: Review Flagged',
                    message: authorMessage,
                }
            });
            console.log("✅ Notification Created Successfully!"); // DEBUG LOG
        } catch (notifError) {
            console.error("❌ Notification Creation FAILED:", notifError); // DEBUG LOG
        }
    } else {
        console.log("⚠️ Skipping notification. Reason:", !reviewAuthorId ? "No Author ID" : "Action is KEEP");
    }

    // --- 5. UPDATE REPORT ---
    // NOTE: We are saving 'reporterMessage' directly. NO "Action:" prefix.
    await prisma.report.update({
        where: { id: reportId },
        data: {
            status: newStatus, 
            resolution: reporterMessage 
        }
    });
    console.log("📝 Report updated with message:", reporterMessage); // DEBUG LOG

    revalidatePath('/admin/reports');
    revalidatePath('/dashboard');

    return { success: true };

  } catch (error) {
    console.error("❌ CRITICAL ERROR in resolveReport:", error);
    return { error: "Failed to resolve report" };
  }
}

// --- 16. DISMISS REPORT (User Dashboard) ---
export async function dismissReport(reportId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Unauthorized" };

  try {
    await prisma.report.update({
      where: { 
        id: reportId,
        userId: userId // Ensure user owns this report
      },
      data: { archived: true }
    });
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return { error: "Failed to dismiss." };
  }
}

// --- 17. NOTIFICATIONS ACTIONS ---

export async function getNotifications() {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Limit to last 10 for the UI
    });
    return notifications;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }
}

export async function getUnreadCount() {
  const session = await auth();
  if (!session?.user?.id) return 0;

  try {
    const count = await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false,
      },
    });
    return count;
  } catch (error) {
    return 0;
  }
}

export async function markAsRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  try {
    await prisma.notification.update({
      where: {
        id: notificationId,
        userId: session.user.id, // Security: Ensure user owns this notification
      },
      data: {
        isRead: true,
      },
    });
    revalidatePath('/'); // Refresh UI
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
}

export async function markAllAsRead() {
    const session = await auth();
    if (!session?.user?.id) return;
  
    try {
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          isRead: false
        },
        data: {
          isRead: true,
        },
      });
      revalidatePath('/');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
}

export async function archiveReport(reportId: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { error: "Unauthorized" };

    try {
        await prisma.report.update({
            where: { id: reportId },
            data: { archived: true } // Now it disappears from the table
        });
        revalidatePath('/admin/reports');
        return { success: true };
    } catch (error) {
        return { error: "Failed to archive" };
    }
}

export async function deleteNotification(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  try {
    await prisma.notification.delete({
      where: {
        id: notificationId,
        userId: session.user.id, // Security: User can only delete their own
      },
    });
    revalidatePath('/'); 
  } catch (error) {
    console.error('Failed to delete notification:', error);
  }
}

export async function toggleCompanyFeatured(companyId: string, currentStatus: boolean) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') return { error: "Unauthorized" };

  try {
    // 1. If we are trying to feature a company (turn it ON)
    // We must check if we already have 6 featured companies.
    if (!currentStatus) {
      const count = await prisma.company.count({
        where: { featured: true }
      });

      if (count >= 6) {
        return { error: "LIMIT_REACHED" }; // <--- Special Error Code
      }
    }

    // 2. Proceed with update
    await prisma.company.update({
      where: { id: companyId },
      data: { featured: !currentStatus }
    });

    revalidatePath('/admin/companies'); 
    revalidatePath('/'); 
    
    return { success: true };

  } catch (error) {
    return { error: "Failed to update status" };
  }
}


// --- 18. CREATE SUPPORT TICKET ---

export async function createSupportTicket(data: any) {
  try {
    await prisma.supportTicket.create({
      data: {
        type: data.type, 
        name: data.name,
        email: data.email,
        message: data.message,
        category: data.category || data.issueType || data.inquiryType,
        
        reviewAuthor: data.reviewAuthor || null,
        reviewTitle: data.reviewTitle || null,
        
        deviceInfo: data.deviceInfo || null,
        companyName: data.companyName || null,
        jobTitle: data.jobTitle || null,
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error("Support Ticket Error:", error);
    return { error: "Failed to submit ticket." };
  }
}

// --- ADMIN: UPDATE TICKET STATUS ---
export async function updateTicketStatus(ticketId: string, newStatus: string) {
  const session = await auth();
  
  // 1. Security Check: Only Admins can close tickets
  if (session?.user?.role !== 'ADMIN') {
    return { error: "Unauthorized" };
  }

  try {
    // 2. Update Database
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: newStatus } // e.g., "CLOSED" or "OPEN"
    });

    // 3. Refresh the Admin Page so the badge updates instantly
    revalidatePath('/admin/support');
    
    return { success: true };
  } catch (error) {
    console.error("Update Ticket Error:", error);
    return { error: "Failed to update status" };
  }
}

// --- 19. ADMIN: GENERATE ANALYTICS REPORTS ---
import { generatePlatformReport, generateAllCompanyReports } from "@/lib/analytics";

export async function generateAnalyticsAction() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') return { error: "Unauthorized" };

  try {
    await generatePlatformReport();
    await generateAllCompanyReports(); // Optional: Might be slow if you have 1000s of companies
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed" };
  }
}

// --- BUSINESS: FIND COMPANY SLUG ---
export async function findCompanySlug(query: string) {
  if (!query) return { error: "Empty query" };

  try {
    const cleanQuery = query.trim();

    // Try to find an exact or close match
    const company = await prisma.company.findFirst({
      where: {
        OR: [
          { name: { equals: cleanQuery, mode: 'insensitive' } }, // Case-insensitive Name
          { websiteUrl: { contains: cleanQuery, mode: 'insensitive' } }, // URL match
          { slug: { equals: cleanQuery.toLowerCase().replace(/\s+/g, '-') } } // Slug guess
        ]
      },
      select: { slug: true }
    });

    if (company) {
      return { success: true, slug: company.slug };
    }
    
    return { success: false };

  } catch (error) {
    console.error("Search failed:", error);
    return { error: "Search failed" };
  }
}

// --- 20. SUBMIT BUSINESS CLAIM ACTION ---
export async function submitBusinessClaim(prevState: any, formData: FormData) {
  // 1. Check if a user is already logged in
  const session = await auth();
  let userId = session?.user?.id;

  // 2. Extract Data
  const workEmail = formData.get('workEmail') as string;
  const jobTitle = formData.get('jobTitle') as string;
  const docFile = formData.get('verificationDoc') as File;
  
  // Logic Flags
  const isNewCompany = formData.get('isNewCompany') === 'true';
  const companyId = formData.get('companyId') as string;

  // 3. IF NO USER IS LOGGED IN -> HANDLE "SHADOW USER" CREATION
  if (!userId) {
     if (!workEmail) {
        return { error: "Work email is required to create your account." };
     }

     try {
       const existingUser = await prisma.user.findUnique({ 
         where: { email: workEmail } 
       });
       
       if (existingUser) {
          userId = existingUser.id;
       } else {
          const newUser = await prisma.user.create({
             data: {
                email: workEmail,
                name: formData.get('businessName') as string || "Business Owner",
                role: 'USER', 
             }
          });
          userId = newUser.id;
       }
     } catch (error) {
       console.error("User Creation Error:", error);
       return { error: "Failed to create business account. Email might be invalid." };
     }
  }

  // 4. Validate Required Fields
  if (!jobTitle || !docFile || docFile.size === 0) {
    return { error: "Please fill in all verification fields and upload a document." };
  }

  try {
    // 5. Upload Verification Document
    const arrayBuffer = await docFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "business_verifications", resource_type: "auto" },
        (error, result) => (error ? reject(error) : resolve(result))
      ).end(buffer);
    });
    
    const docUrl = uploadResult.secure_url;

    // 6. Create the Claim Record
    if (isNewCompany) {
       // --- REGISTER NEW COMPANY CLAIM ---
       const businessName = formData.get('businessName') as string;
       const website = formData.get('website') as string;
       const categoryId = formData.get('categoryId') as string;
       
       // 👇 UPDATED: Get Country and State (Removed City)
       const country = formData.get('country') as string;
       const state = formData.get('state') as string;

       if (!businessName || !categoryId) return { error: "Company name and category are required." };

       await prisma.businessClaim.create({
         data: {
           userId, 
           businessName,
           website,
           categoryId,
           country,
           state, 
           workEmail,
           jobTitle,
           verificationDoc: docUrl,
           status: "PENDING"
         }
       });

    } else {
       // --- CLAIM EXISTING COMPANY ---
       if (!companyId) return { error: "Invalid company selected." };
       
       const existing = await prisma.company.findUnique({ where: { id: companyId }});
       if (existing?.claimed) return { error: "This company is already claimed." };

       await prisma.businessClaim.create({
         data: {
           userId,
           companyId,
           workEmail,
           jobTitle,
           verificationDoc: docUrl,
           status: "PENDING"
         }
       });
    }

    return { success: true };

  } catch (error) {
    console.error("Claim Error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

// --- 2. SET PASSWORD ACTION (For the Invite Flow) ---
export async function setPasswordAction(prevState: any, formData: FormData) {
  const token = formData.get('token') as string;
  const password = formData.get('password') as string;
  const confirm = formData.get('confirm') as string;

  if (password !== confirm) return { error: "Passwords do not match." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  try {
    // 1. Find the Token
    const invite = await prisma.inviteToken.findUnique({ where: { token } });
    
    // 2. Validate Token
    if (!invite || invite.expires < new Date()) {
       return { error: "Invalid or expired token." };
    }

    // 3. Hash the New Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Update the User's Password
    await prisma.user.update({
      where: { email: invite.email },
      data: { password: hashedPassword }
    });

    // 5. Delete the Token (One-time use)
    await prisma.inviteToken.delete({ where: { id: invite.id } });

    return { success: true };

  } catch (error) {
    console.error("Set Password Error:", error);
    return { error: "Failed to set password. Please try again." };
  }
}

// --- APPROVE CLAIM ---
export async function approveBusinessClaim(claimId: string) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') return { error: "Unauthorized" };

  try {
    // 1. Fetch Claim
    const claim = await prisma.businessClaim.findUnique({ where: { id: claimId } });
    if (!claim) return { error: "Claim not found" };

    let targetCompanyId = claim.companyId;

    // 2. Create Company (If New)
    if (!targetCompanyId) {
       if(!claim.businessName || !claim.categoryId) return { error: "Data missing" };
       const slug = claim.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
       
       // Simple category fetch for MVP
       const category = await prisma.category.findUnique({ 
         where: { id: claim.categoryId }, 
         include: { subCategories: true }
       });
       const subId = category?.subCategories[0]?.id;
       
       const newCompany = await prisma.company.create({
          data: {
             name: claim.businessName,
             slug: `${slug}-${crypto.randomBytes(4).toString('hex')}`,
             websiteUrl: claim.website,
             categoryId: claim.categoryId,
             subCategoryId: subId!, 
             city: claim.city,
             country: claim.country,
             claimed: true,
             claimedAt: new Date(),
             companyType: "SERVICE",
          }
       });
       targetCompanyId = newCompany.id;
    } else {
       // Mark existing as claimed
       await prisma.company.update({ 
         where: { id: targetCompanyId }, 
         data: { claimed: true, claimedAt: new Date(), } 
       });
    }

    // 3. Generate Invite Token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.inviteToken.create({
      data: {
        email: claim.workEmail,
        token,
        expires
      }
    });

    // 4. Upgrade User & Update Claim
    // Using transaction to ensure database integrity
    await prisma.$transaction([
      prisma.user.update({
        where: { id: claim.userId },
        data: { role: "BUSINESS", companyId: targetCompanyId }
      }),
      prisma.businessClaim.update({
        where: { id: claimId },
        data: { status: "APPROVED", companyId: targetCompanyId } 
      })
    ]);

    // 5. SEND EMAIL
    const businessName = claim.businessName || "your business";
    console.log(`Sending approval email to: ${claim.workEmail}`);
    
    // We don't await the result to block the UI, but we log errors if they happen
    const emailResult = await sendApprovalEmail(claim.workEmail, token, businessName);
    
    if (!emailResult.success) {
      console.error("Warning: Database updated but email failed to send.");
    }

    revalidatePath('/admin/claims');
    return { success: true };

  } catch (error) {
    console.error("Approval Error:", error);
    return { error: "Failed to approve." };
  }
}

// --- REJECT CLAIM ---
export async function rejectBusinessClaim(claimId: string) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') return { error: "Unauthorized" };

  try {
    const claim = await prisma.businessClaim.findUnique({ where: { id: claimId } });
    if (!claim) return { error: "Claim not found" };

    // 1. Update Status to REJECTED
    await prisma.businessClaim.update({
      where: { id: claimId },
      data: { status: "REJECTED" }
    });

    // 2. SEND REJECTION EMAIL
    const businessName = claim.businessName || "your business";
    console.log(`Sending rejection email to: ${claim.workEmail}`);

    const emailResult = await sendRejectionEmail(claim.workEmail, businessName);

    if (!emailResult.success) {
      console.error("Warning: Claim rejected but email failed to send.");
    }

    revalidatePath('/admin/claims');
    return { success: true };

  } catch (error) {
    console.error("Rejection Error:", error);
    return { error: "Failed to reject claim." };
  }
}

// --- UPDATE COMPANY PROFILE ---
export async function updateCompanyProfile(prevState: any, formData: FormData) {
  const session = await auth();
  
  if (!session?.user?.companyId) {
    return { error: "Unauthorized. You must be logged in as a business." };
  }
  
  const companyId = session.user.companyId;

  // 1. Extract Text Data
  const briefIntroduction = formData.get('description') as string;
  const websiteUrl = formData.get('websiteUrl') as string;
  const subCategoryId = formData.get('subCategoryId') as string;
  const categoryId = formData.get('categoryId') as string;
  
  // Location
  const address = formData.get('address') as string; 
  const city = formData.get('city') as string;
  const country = formData.get('country') as string;
  const state = formData.get('state') as string;
  const subCity = formData.get('subCity') as string;

  // Contact
  const publicEmail = formData.get('publicEmail') as string;
  const phoneNumber = formData.get('phoneNumber') as string;

  // 2. Handle Logo Upload Only
  const logoFile = formData.get('logo') as File;
  let logoUrl = undefined;

  try {
    if (logoFile && logoFile.size > 0) {
       const arrayBuffer = await logoFile.arrayBuffer();
       const buffer = Buffer.from(arrayBuffer);
       
       const res = await new Promise<any>((resolve, reject) => {
          cloudinary.uploader.upload_stream(
             { folder: "company_logos", resource_type: "image" },
             (error, result) => (error ? reject(error) : resolve(result))
          ).end(buffer);
       });
       
       logoUrl = res.secure_url;
    }

    // 3. Update Database
    await prisma.company.update({
      where: { id: companyId },
      data: {
        briefIntroduction,
        websiteUrl,
        address, 
        city,
        country,
        state,
        subCity,
        subCategoryId,
        categoryId,

        contact: {
           set: {
              email: publicEmail,
              phone: phoneNumber
           }
        },

        // Only update logo if a new one was uploaded
        ...(logoUrl && { logoImage: logoUrl }),
      }
    });

    return { success: true };

  } catch (error) {
    console.error("Update Profile Error:", error);
    return { error: "Failed to update profile. Please try again." };
  }
}

// --- REPLY TO REVIEW ---
export async function replyToReview(prevState: any, formData: FormData) {
  const session = await auth();

  // 1. Security & Validation
  if (!session?.user?.companyId) {
    return { error: "Unauthorized. You must be logged in as a business." };
  }

  const reviewId = formData.get('reviewId') as string;
  const replyText = formData.get('replyText') as string;

  if (!reviewId || !replyText || replyText.trim().length === 0) {
    return { error: "Reply cannot be empty." };
  }

  try {
    // 2. Verify Ownership & Fetch Context
    // We update this query to grab the Customer's ID and Company Name
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { 
        companyId: true,
        userId: true, // <--- Needed to send notification
        company: {    // <--- Needed for the notification title
            select: { name: true, slug: true }
        }
      }
    });

    // Check if review exists and belongs to the logged-in business
    if (!review || review.companyId !== session.user.companyId) {
      return { error: "You can only reply to reviews for your own company." };
    }

    // 3. Save the Reply
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        ownerReply: replyText,
        ownerReplyDate: new Date()
      }
    });

    // 4. --- NEW: SEND NOTIFICATION TO USER ---
    if (review.userId) {
        await prisma.notification.create({
            data: {
                userId: review.userId,
                title: `New Reply from ${review.company.name}`,
                message: `${review.company.name} has replied to your review: "${replyText.substring(0, 50)}${replyText.length > 50 ? '...' : ''}"`,
                isRead: false,
                // If you add a 'link' field to your schema later, you can link to: `/company/${review.company.slug}`
            }
        });
    }

    // 5. Revalidate
    revalidatePath('/business/dashboard/reviews');
    
    // Also revalidate the specific company page so the public sees it immediately
    revalidatePath(`/company/${review.company.slug}`);

    return { success: true };

  } catch (error) {
    console.error("Reply Error:", error);
    return { error: "Failed to post reply. Please try again." };
  }
}

// --- DELETE REVIEW REPLY ---
export async function deleteReviewReply(reviewId: string) {
  const session = await auth();

  if (!session?.user?.companyId) {
    return { error: "Unauthorized" };
  }

  try {
    // 1. Verify Ownership
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { companyId: true }
    });

    if (!review || review.companyId !== session.user.companyId) {
      return { error: "Unauthorized" };
    }

    // 2. Remove Reply (Set to null)
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        ownerReply: null,
        ownerReplyDate: null
      }
    });

    // 3. Revalidate
    revalidatePath('/business/dashboard/reviews');
    // Also revalidate the public page if you can derive the slug, 
    // but for simplicity dashboard refresh is priority.
    
    return { success: true };

  } catch (error) {
    return { error: "Failed to delete reply" };
  }
}
// --- CATEGORIES & SUBCATEGORIES ACTIONS ---
export async function createCategory(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

  if (!name) return { error: "Name is required" };

  try {
    await prisma.category.create({
      data: { name, slug }
    });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    return { error: "Failed to create category. Slug might be duplicate." };
  }
}

export async function deleteCategory(id: string) {
  try {
    // Optional: Check if used by companies first?
    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete category." };
  }
}

// --- SUBCATEGORIES ---

export async function createSubCategory(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const categoryId = formData.get("categoryId") as string;
  const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

  if (!name || !categoryId) return { error: "Name and Parent Category are required" };

  try {
    await prisma.subCategory.create({
      data: { name, slug, categoryId }
    });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    return { error: "Failed to create subcategory." };
  }
}

export async function deleteSubCategory(id: string) {
  try {
    await prisma.subCategory.delete({ where: { id } });
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete subcategory." };
  }
}

const UpdateSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  content: z.string().min(10, "Content must be at least 10 characters"),
  linkUrl: z.string().optional().or(z.literal("")),
  companyId: z.string(),
});

// Helper to upload file to Cloudinary
async function uploadToCloudinary(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "business-updates",transformation: [{ width: 1200, crop: "limit", quality: "auto", fetch_format: "auto" }] }, // Optional folder
      (error, result) => {
        if (error) return reject(error);
        resolve(result?.secure_url || "");
      }
    ).end(buffer);
  });
}

export async function createBusinessUpdate(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    // 1. Extract Data
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const linkUrl = formData.get("linkUrl") as string;
    const companyId = formData.get("companyId") as string;
    const imageFile = formData.get("image") as File;

    // 2. Validate Text Fields
    const validated = UpdateSchema.safeParse({ title, content, linkUrl, companyId });
    if (!validated.success) {
      return { error: "Invalid fields: " + validated.error.issues[0].message };
    }

    // 3. Verify Ownership
    const claim = await prisma.businessClaim.findFirst({
      where: { userId: session.user.id, companyId },
    });
    if (!claim) return { error: "Unauthorized operation." };

    // 4. Handle Image Upload
    if (!imageFile || imageFile.size === 0) {
      return { error: "Image is required." };
    }

    let imageUrl = "";
    try {
      imageUrl = await uploadToCloudinary(imageFile);
    } catch (uploadError) {
      console.error("Upload failed:", uploadError);
      return { error: "Failed to upload image." };
    }

    // 5. Save to DB
    await prisma.businessUpdate.create({
      data: {
        title,
        content,
        imageUrl,
        linkUrl: linkUrl || "",
        companyId,
      },
    });

    revalidatePath(`/business/dashboard/${companyId}/updates`);
    revalidatePath(`/company/[slug]`); // You might need to pass slug if you have it, or rely on page params
    
    return { success: "Update published successfully!" };

  } catch (error) {
    console.error("Server Action Error:", error);
    return { error: "Something went wrong." };
  }
}

export async function deleteBusinessUpdate(updateId: string, companyId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    // SECURITY CHECK: Verify ownership via BusinessClaim
    const claim = await prisma.businessClaim.findFirst({
      where: {
        userId: session.user.id,
        companyId: companyId,
        // Optional: specific logic if you have statuses like 'APPROVED'
        // status: 'APPROVED' 
      }
    });

    if (!claim) {
      return { error: "Unauthorized: You do not have permission to manage this company." };
    }

    // Proceed to delete
    await prisma.businessUpdate.delete({
      where: { id: updateId },
    });

    revalidatePath(`/business/dashboard/${companyId}/updates`);
    revalidatePath(`/company/[slug]`); 
    return { success: "Update deleted successfully" };
  } catch (error) {
    console.error("Delete error:", error);
    return { error: "Failed to delete update" };
  }
}

export async function updateBusinessUpdate(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    // 1. Extract Data
    const updateId = formData.get("updateId") as string;
    const companyId = formData.get("companyId") as string;
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const linkUrl = formData.get("linkUrl") as string;
    const imageFile = formData.get("image") as File;

    if (!updateId || !companyId || !title || !content) {
      return { error: "Missing required fields." };
    }

    // 2. Security: Verify Ownership via BusinessClaim (Matching your existing pattern)
    const claim = await prisma.businessClaim.findFirst({
      where: { userId: session.user.id, companyId },
    });

    if (!claim) {
      return { error: "Unauthorized: You do not have permission to manage this company." };
    }

    // 3. Handle Image Logic
    // If a new image is provided, upload it. Otherwise, we keep the old one.
    let imageUrl; 
    
    if (imageFile && imageFile.size > 0) {
      try {
        // Reuse your existing helper function
        imageUrl = await uploadToCloudinary(imageFile);
      } catch (uploadError) {
        console.error("Upload failed:", uploadError);
        return { error: "Failed to upload new image." };
      }
    }

    // 4. Update Database
    // We construct the data object dynamically so we only update imageUrl if it changed
    const dataToUpdate: any = {
      title,
      content,
      linkUrl: linkUrl || "",
    };

    if (imageUrl) {
      dataToUpdate.imageUrl = imageUrl;
    }

    await prisma.businessUpdate.update({
      where: { id: updateId },
      data: dataToUpdate,
    });

    // 5. Revalidate
    revalidatePath(`/business/dashboard/updates`); 
    // If your path uses ID: revalidatePath(`/business/dashboard/${companyId}/updates`);
    
    return { success: "Article updated successfully!" };

  } catch (error) {
    console.error("Update Action Error:", error);
    return { error: "Failed to update article." };
  }
}

export async function sendDomainVerification(formData: FormData) {
  const session = await auth();
  if (!session?.user?.companyId) return { error: "Unauthorized" };

  const email = formData.get("companyEmail") as string;
  
  // Basic validation
  if (!email || !email.includes("@")) return { error: "Invalid email address" };
  
  // Optional: Block generic domains
  const forbiddenDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"];
  const emailDomain = email.split("@")[1];
  if (forbiddenDomains.includes(emailDomain)) {
      return { error: "Please use a business domain (e.g. name@company.com)" };
  }

  const token = uuidv4();

  try {
    // Save token to Company model
    await prisma.company.update({
      where: { id: session.user.companyId },
      data: {
        domainVerifyToken: token,
        domainVerifyEmail: email,
      },
    });

    // Send Email
    await sendDomainVerificationEmail(email, token);

    return { success: true };
  } catch (error) {
    console.error("Domain Verify Error:", error);
    return { error: "Failed to send email. Please try again." };
  }
}

// --- 2. VERIFY TOKEN (Link Clicked) ---
export async function verifyDomainToken(token: string) {
  // Find company with this token
  const company = await prisma.company.findFirst({
    where: { domainVerifyToken: token },
  });

  if (!company) return { error: "Invalid or expired token." };

  // Update status
  await prisma.company.update({
    where: { id: company.id },
    data: {
      domainVerified: new Date(), // ✅ Set verified date
      domainVerifyToken: null,    // Clear token
    },
  });

  return { success: true, companyName: company.name };
}

// --- CREATE CAMPAIGN ACTION ---
export async function createCampaign(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.companyId) return { error: "Unauthorized" };
  const companyId = session.user.companyId;

  // Check the "action" type (sent from the button)
  const actionType = formData.get("actionType") as string; // 'DRAFT' or 'SEND'

  const name = formData.get("name") as string;
  const subject = formData.get("subject") as string;
  const senderEmail = formData.get("senderEmail") as string;
  const htmlContent = formData.get("htmlContent") as string;
  const recipientsRaw = formData.get("recipients") as string;

  // ✅ 1. NEW: Extract Template Fields
  const templateType = (formData.get("templateType") as "INVITE" | "PROMOTIONAL") || "INVITE";
  const customBtnText = formData.get("customBtnText") as string;
  const customBtnUrl = formData.get("customBtnUrl") as string;

  // Basic Validation (Drafts can be partial, but let's require basics)
  if (!name || !subject) return { error: "Name and Subject are required." };

  // Handle Images (Your Existing Logic Preserved)
  const logoFile = formData.get("logo") as File;
  const bannerFile = formData.get("banner") as File;
  let logoUrl = null;
  let bannerUrl = null;

  try {
     const uploadImage = async (file: File, folder: string) => {
        if(file && file.size > 0) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const res = await new Promise<any>((resolve, reject) => {
                cloudinary.uploader.upload_stream({ folder,transformation: [{ width: 800, crop: "limit", quality: "auto", fetch_format: "auto" }] }, (err, result) => err ? reject(err) : resolve(result)).end(buffer);
            });
            return res.secure_url;
        }
        return null;
     };
     if (logoFile.size > 0) logoUrl = await uploadImage(logoFile, "campaign_logos");
     if (bannerFile.size > 0) bannerUrl = await uploadImage(bannerFile, "campaign_banners");
  } catch (e) {
     console.error("Image Upload Failed", e);
  }

  // Process Recipients
  const recipientList = recipientsRaw
    .split(/[\n, ]+/) 
    .map(email => email.trim())
    .filter(email => email.includes("@"));

  // Fetch Company
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { name: true, slug: true, logoImage: true }
  });
  
  const finalLogo = logoUrl || company?.logoImage;

  // ✅ 2. NEW: Determine Button Logic
  const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const profileLink = `${domain}/company/${company?.slug}`;
  
  // If promotional, use custom inputs. If invite, use defaults.
  const finalBtnText = templateType === "PROMOTIONAL" ? customBtnText : "Rate Your Experience";
  const finalBtnUrl = templateType === "PROMOTIONAL" ? customBtnUrl : profileLink;

  // --- LOGIC SPLIT ---
  let sentCount = 0;
  let status = "DRAFT";
  let sentAt = null;

  // ONLY send emails if the user clicked "Send Campaign"
  if (actionType === "SEND") {
      if (recipientList.length === 0) return { error: "Recipients required for sending." };

      const limitCheck = await checkEmailLimit(companyId, recipientList.length);
      if (!limitCheck.allowed) {
          return { error: limitCheck.error }; // Stop execution here
      }
      
      for (const recipient of recipientList) {
        // ✅ 3. UPDATE: Pass new button args to your email helper
        await sendProfessionalCampaign(
           recipient,
           company?.name || "Business",
           senderEmail,
           subject,
           htmlContent,
           finalBtnUrl, // Use the calculated URL
           finalLogo,
           bannerUrl,
           finalBtnText // Pass the button text (Ensure your helper accepts this optional arg!)
        );
        sentCount++;
      }
      await incrementEmailUsage(companyId, sentCount);

      status = "SENT";
      sentAt = new Date();
  }

  // Save to DB (Status will be DRAFT or SENT)
  // ✅ 4. UPDATE: Save new fields
  await prisma.campaign.create({
    data: {
      companyId,
      name,
      subject,
      senderEmail,
      content: htmlContent,
      logoUrl: finalLogo,
      bannerUrl,
      recipients: recipientList,
      sentCount,
      status: status as any, // Cast to enum
      sentAt,
      // New Fields
      templateType,
      buttonText: templateType === "PROMOTIONAL" ? customBtnText : null,
      buttonUrl: templateType === "PROMOTIONAL" ? customBtnUrl : null
    }
  });

  revalidatePath('/business/dashboard/marketing');
  return { success: true, status };
}

// --- UPDATE DRAFT ACTION ---
export async function updateDraft(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.companyId) return { error: "Unauthorized" };

  const campaignId = formData.get("campaignId") as string;
  const name = formData.get("name") as string;
  const subject = formData.get("subject") as string;
  const htmlContent = formData.get("htmlContent") as string;
  const recipientsRaw = formData.get("recipients") as string;
  
  // ✅ 5. NEW: Extract Template Fields for Update
  const templateType = (formData.get("templateType") as "INVITE" | "PROMOTIONAL") || "INVITE";
  const customBtnText = formData.get("customBtnText") as string;
  const customBtnUrl = formData.get("customBtnUrl") as string;

  // Handle Images (Optional Update)
  const logoFile = formData.get("logo") as File;
  const bannerFile = formData.get("banner") as File;

  try {
    // 1. Verify Ownership & Status
    const existingCampaign = await prisma.campaign.findUnique({
        where: { id: campaignId, companyId: session.user.companyId }
    });

    if (!existingCampaign || existingCampaign.status === "SENT") {
        return { error: "Cannot edit this campaign." };
    }

    // 2. Upload New Images (if provided)
    let logoUrl = existingCampaign.logoUrl;
    let bannerUrl = existingCampaign.bannerUrl;

    // Reuse your upload logic or import a helper
    const uploadImage = async (file: File, folder: string) => {
        if(file && file.size > 0) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const res = await new Promise<any>((resolve, reject) => {
                cloudinary.uploader.upload_stream({ folder }, (err, result) => err ? reject(err) : resolve(result)).end(buffer);
            });
            return res.secure_url;
        }
        return null;
    };

    if (logoFile && logoFile.size > 0) logoUrl = await uploadImage(logoFile, "campaign_logos");
    if (bannerFile && bannerFile.size > 0) bannerUrl = await uploadImage(bannerFile, "campaign_banners");

    // 3. Process Recipients
    const recipientList = recipientsRaw
      .split(/[\n, ]+/) 
      .map(email => email.trim())
      .filter(email => email.includes("@"));

    // 4. Update Database
    // ✅ 6. UPDATE: Save new fields
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        name,
        subject,
        content: htmlContent,
        recipients: recipientList,
        logoUrl,
        bannerUrl,
        updatedAt: new Date(),
        // New Fields
        templateType,
        buttonText: templateType === "PROMOTIONAL" ? customBtnText : null,
        buttonUrl: templateType === "PROMOTIONAL" ? customBtnUrl : null
      }
    });

    revalidatePath('/business/dashboard/marketing');
    return { success: "Draft updated successfully!" };
  } catch (error) {
    console.error("Update Draft Error:", error);
    return { error: "Failed to update draft." };
  }
}

// 2. SEND DRAFT ACTION (Updated Logic)
export async function sendDraft(campaignId: string) {
    const session = await auth();
    if (!session?.user?.companyId) return { error: "Unauthorized" };

    const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId, companyId: session.user.companyId }
    });

    if (!campaign || campaign.status === "SENT") return { error: "Invalid campaign." };

    const limitCheck = await checkEmailLimit(session.user.companyId, campaign.recipients.length);
    if (!limitCheck.allowed) {
        return { error: limitCheck.error };
    }

    // Fetch Company Info again for the link
    const company = await prisma.company.findUnique({
        where: { id: session.user.companyId },
        select: { name: true, slug: true }
    });

    // ✅ 7. NEW: Recalculate Button Logic based on Saved Data
    const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const profileLink = `${domain}/company/${company?.slug}`;

    const finalBtnText = campaign.templateType === "PROMOTIONAL" 
       ? campaign.buttonText || "View Details" 
       : "Rate Your Experience";

    const finalBtnUrl = campaign.templateType === "PROMOTIONAL" 
       ? campaign.buttonUrl || profileLink
       : profileLink;

    // Send the emails
    let count = 0;
    for (const recipient of campaign.recipients) {
        // ✅ 8. UPDATE: Pass correct button args
        await sendProfessionalCampaign(
            recipient,
            company?.name || "Business",
            campaign.senderEmail,
            campaign.subject,
            campaign.content,
            finalBtnUrl, // Recalculated URL
            campaign.logoUrl,
            campaign.bannerUrl,
            finalBtnText // Recalculated Text
        );
        count++;
    }

    await incrementEmailUsage(session.user.companyId, count);

    // Update Status
    await prisma.campaign.update({
        where: { id: campaignId },
        data: {
            status: "SENT",
            sentCount: count,
            sentAt: new Date()
        }
    });

    revalidatePath('/business/dashboard/marketing');
    return { success: true };
}

// --- DELETE CAMPAIGN (Unchanged) ---
export async function deleteCampaign(campaignId: string) {
  const session = await auth();
  if (!session?.user?.companyId) return { error: "Unauthorized" };

  try {
    await prisma.campaign.delete({
      where: { 
        id: campaignId,
        companyId: session.user.companyId // Security check: ensure ownership
      }
    });
    
    revalidatePath('/business/dashboard/marketing');
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete campaign." };
  }
}


export async function toggleCompanyPlan(companyId: string, newPlan: "FREE" | "PRO") {
  const session = await auth();
  
  // Basic Admin Check (You can enhance this)
  if (!session?.user?.id) return { error: "Unauthorized" };
  
  // Ideally, check if user is ADMIN role here
   if (session.user.role !== "ADMIN") return { error: "Forbidden" };

  try {
    await prisma.company.update({
      where: { id: companyId },
      data: { plan: newPlan }
    });

    revalidatePath("/admin/plans");
    revalidatePath(`/business/dashboard/${companyId}`); 
    return { success: `Plan updated to ${newPlan}` };
  } catch (error) {
    return { error: "Failed to update plan" };
  }
}


export async function toggleSponsoredStatus(
  companyId: string, 
  status: boolean, 
  scope: "GLOBAL" | "LOCAL" | null
) {
  try {
    await prisma.company.update({
      where: { id: companyId },
      data: {
        isSponsored: status,
        // If turning OFF, force scope to null. If ON, use the provided scope.
        sponsoredScope: status ? scope : null 
      }
    });

    // Refresh pages where this change matters
    revalidatePath("/categories"); 
    revalidatePath("/admin/companies"); 
    
    return { success: true };
  } catch (error) {
    console.error("Sponsored Update Error:", error);
    return { error: "Failed to update sponsored status" };
  }
}

export async function toggleCompanyFreeze(companyId: string, shouldFreeze: boolean) {
  const session = await auth();

  // 1. Security Check: Ensure user is an Admin
  if (!session || session.user.role !== "ADMIN") {
    return { error: "Unauthorized. Admin access required." };
  }

  try {
    // 2. Update the Company in the Database
    await prisma.company.update({
      where: { id: companyId },
      data: { 
        isFrozen: shouldFreeze 
      }
    });

    // 3. Revalidate the Admin Page so the table updates immediately
    revalidatePath("/admin/companies"); 
    
    // Optional: Revalidate the specific company's public/private pages if needed
     revalidatePath(`/business/dashboard`); 

    return { success: true };
  } catch (error) {
    console.error("Freeze Action Error:", error);
    return { error: "Failed to update company status." };
  }
}

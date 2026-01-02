import nodemailer from "nodemailer";

const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Configure the email transporter using your Gmail credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,     // From your .env file
    pass: process.env.SMTP_PASSWORD,  // From your .env file
  },
});

// --- 1. SEND APPROVAL EMAIL ---
export const sendApprovalEmail = async (email: string, token: string, businessName: string) => {
  const confirmLink = `${domain}/business/set-password?token=${token}`;

  try {
    const info = await transporter.sendMail({
      from: `"Help Platform" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "✅ Your Business Account is Approved!",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #000032;">Welcome to Help!</h1>
          <p>Hello,</p>
          <p>Great news! We have verified your claim for <strong>${businessName}</strong>.</p>
          <p>You can now access your business dashboard to manage reviews, reply to customers, and view analytics.</p>
          
          <div style="margin: 30px 0;">
            <a href="${confirmLink}" style="background-color: #0ABED6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Set Password & Access Dashboard
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            Or copy this link: <br/>
            <a href="${confirmLink}">${confirmLink}</a>
          </p>
        </div>
      `,
    });
    console.log("✅ Approval Email Sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("❌ Nodemailer Error (Approval):", error);
    return { success: false, error };
  }
};

// --- 2. SEND REJECTION EMAIL ---
export const sendRejectionEmail = async (email: string, businessName: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"Help Platform" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Update on your Business Verification Request",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #000032;">Verification Update</h2>
          <p>Hello,</p>
          <p>Thank you for your interest in claiming <strong>${businessName}</strong> on Help.</p>
          <p>Unfortunately, we were unable to verify your request with the documents provided.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0;">
            <strong>Common reasons include:</strong>
            <ul style="margin-bottom: 0;">
              <li>Uploaded document was blurry or unreadable.</li>
              <li>Document name did not match the business name.</li>
              <li>Email domain provided was personal (e.g., gmail) instead of business.</li>
            </ul>
          </div>
          
          <p>If you believe this is an error, please reply to this email.</p>
        </div>
      `,
    });
    console.log("✅ Rejection Email Sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("❌ Nodemailer Error (Rejection):", error);
    return { success: false, error };
  }
};

// --- SEND DOMAIN VERIFICATION EMAIL ---
export const sendDomainVerificationEmail = async (email: string, token: string) => {
  const verifyLink = `${domain}/business/verify-domain?token=${token}`;

  try {
    await transporter.sendMail({
      from: `"Help Business Security" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Action Required: Verify Company Domain",
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #000032;">Verify Domain Ownership</h2>
          <p>Hello,</p>
          <p>We received a request to verify the domain <strong>${email}</strong> for your Business Dashboard.</p>
          <p>Click the button below to confirm ownership. This helps secure your account.</p>
          
          <div style="margin: 30px 0;">
            <a href="${verifyLink}" style="background-color: #0ABED6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Verify Domain
            </a>
          </div>
          
          <p style="font-size: 12px; color: #888;">
            Link expires in 24 hours.
          </p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("❌ Domain Email Error:", error);
    return { success: false, error };
  }
};


import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ SEND REVIEW INVITE VIA RESEND
export const sendReviewInvite = async (
  toEmail: string, 
  businessName: string, 
  senderEmail: string, // The Business Owner's Email (Reply-To)
  customMessage: string,
  reviewLink: string
) => {
  try {
    const data = await resend.emails.send({
      // 1. FROM: Use Resend's default until you verify your own domain (e.g., invites@help.com)
      // The format is: "Business Name <system-email>"
      from: `${businessName} <onboarding@resend.dev>`, 
      
      // 2. REPLY-TO: This is the magic. Replies go to the business owner.
      replyTo: senderEmail,
      
      to: [toEmail],
      subject: `Invitation from ${businessName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 800px; margin: 0 auto; color: #333; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #f9fafb; padding: 20px; border-bottom: 1px solid #e5e7eb;">
             <h2 style="color: #000032; margin: 0; font-size: 20px;">${businessName}</h2>
          </div>
          
          <div style="padding: 30px;">
            <p style="font-size: 16px; line-height: 1.6; color: #374151; white-space: pre-wrap;">${customMessage}</p>
            
            <div style="margin: 35px 0; text-align: center;">
              <a href="${reviewLink}" style="background-color: #0ABED6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                Rate & Review Us
              </a>
            </div>

            <p style="font-size: 14px; color: #6b7280; text-align: center;">
              Your feedback helps us improve and serves our community.
            </p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
            Sent by <strong>${businessName}</strong> using the Help Platform.<br/>
            (Replies will be sent to ${senderEmail})
          </div>
        </div>
      `,
    });

    if (data.error) {
      console.error("Resend API Error:", data.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Email Campaign Failed:", error);
    return false;
  }
};

// lib/mail.ts

export const sendProfessionalCampaign = async (
  toEmail: string, 
  businessName: string, 
  replyTo: string, 
  subject: string,
  htmlBody: string, // The rich text from editor
  reviewLink: string,
  logoUrl?: string | null,
  bannerUrl?: string | null
) => {
  
  // Construct HTML
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; background-color: #ffffff;">
      
      ${logoUrl ? `
        <div style="text-align: center; padding: 20px; border-bottom: 1px solid #f0f0f0;">
           <img src="${logoUrl}" alt="${businessName}" style="height: 50px; object-fit: contain;" />
        </div>
      ` : ''}

      ${bannerUrl ? `
        <div style="width: 100%; overflow: hidden;">
           <img src="${bannerUrl}" alt="Promo" style="width: 100%; height: auto; display: block;" />
        </div>
      ` : ''}

      <div style="padding: 30px; color: #333; line-height: 1.6;">
         ${htmlBody}
      </div>

      <div style="text-align: center; padding: 0 20px 30px;">
         <a href="${reviewLink}" style="background-color: #0ABED6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
            Write a Review
         </a>
      </div>

      <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee;">
         Sent by ${businessName} via Help Platform.<br/>
         <a href="#" style="color: #999;">Unsubscribe</a>
      </div>
    </div>
  `;

  // Send via Resend
  await resend.emails.send({
    from: `${businessName} <onboarding@resend.dev>`,
    to: [toEmail],
    replyTo: replyTo,
    subject: subject,
    html: emailHtml
  });
};
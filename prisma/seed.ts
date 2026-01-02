import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// --- 1. HELPERS ---

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-');  // Replace multiple - with single -
}

function generateKeywords(name: string, cat: string, sub: string, city: string, country: string) {
  const words = [
    ...name.toLowerCase().split(' '),
    cat.toLowerCase(),
    sub.toLowerCase(),
    city.toLowerCase(),
    country.toLowerCase(),
    'service', 'best', 'top rated', 'review', 'company', 'trusted', 'verified'
  ];
  return [...new Set(words)].filter(w => w.length > 1);
}

// Generates a professional 10-line description
function generateDescription(name: string, category: string, subCategory: string, city: string) {
  return `
    ${name} is a premier provider of ${subCategory.toLowerCase()} services, proudly headquartered in the heart of ${city}. 
    Founded with a mission to revolutionize the ${category.toLowerCase()} industry, we have spent years building a reputation for reliability and excellence. 
    Our team consists of dedicated professionals who are passionate about delivering top-tier solutions tailored to your specific needs. 
    We believe in transparency and putting the customer first, which is why thousands of clients trust us every day. 
    Whether you are looking for innovation, efficiency, or simply the best service in the market, ${name} is here to help. 
    We strictly adhere to global standards of quality and have been recognized by multiple industry awards for our outstanding performance. 
    Our commitment to sustainability and ethical business practices sets us apart from the competition. 
    We offer 24/7 support to ensure that you are never left without assistance when you need it most. 
    Join our growing community of satisfied customers and experience the difference today. 
    At ${name}, your satisfaction is not just a goal; it is our guarantee.
  `.replace(/\s+/g, ' ').trim();
}

// Maps keywords to stable Unsplash Image IDs
function getKeywordImageId(keyword: string) {
  const map: Record<string, string> = {
    'bank': '1579621970795-87facc2f976d',
    'credit card': '1556742049-0cfed4f7a07d',
    'money': '1554672032-712c26d59b08',
    'travel': '1506785664030-ad3482d8495f',
    'backpacker': '1526772662003-6eb4a1a0bbef',
    'clothing': '1483985988355-763728e1935b',
    'gadget': '1511707171634-61677dbf9fa4',
    'sofa': '1555041469-a586c61ea9bc',
    'diamond': '1617038260897-41a1f14a8ca0',
    'shoes': '1543163521-1bf539c55dd2',
    'cloud': '1551288049-bebda4e38f71',
    'art': '1513364776144-60967b0f800f',
    'code': '1587620962725-abab7fe55159',
    'wifi': '1518770660439-4636190af475',
    'doctor': '1551076805-e1869033e561',
    'dentist': '1588776814546-1b92d5d168b6',
    'therapy': '1571019614242-c5c5dee9f50b',
    'car': '1568605117036-5fe5e7bab0b7',
    'mechanic': '1632823471565-1ecdf5c6d927',
    'house': '1564013799919-ab600027ffc6',
    'apartment': '1493809842364-78817add7ffb',
    'student': '1523050854058-8df90110c9f1',
    'book': '1495446815901-a7297e633e8d',
    'gym': '1534438327276-14e5300c3a48',
    'yoga': '1599447421405-0ea5dc66593a',
    'dog': '1543466835-00a7907e9de1',
    'veterinarian': '1623366302587-3e3515852384'
  };
  return map[keyword] || '1551288049-bebda4e38f71';
}

// --- 2. DATA LISTS ---

const userNames = [
  "Mayank Agarwal", "Emil Sandler", "Pinky Sahu", "Linda Savage", "John Doe",
  "Sarah Jenkins", "Mike Ross", "Jessica Pearson", "Harvey Specter", "Louis Litt",
  "Rachel Zane", "Donna Paulsen", "Alex Williams", "Samantha Wheeler", "Robert Zane"
];

const locations = [
  { city: 'New York', country: 'USA' },
  { city: 'San Francisco', country: 'USA' },
  { city: 'Austin', country: 'USA' },
  { city: 'London', country: 'UK' },
  { city: 'Manchester', country: 'UK' },
  { city: 'Leeds', country: 'UK' },
  { city: 'Mumbai', country: 'India' },
  { city: 'Delhi', country: 'India' },
  { city: 'Bangalore', country: 'India' },
];

const taxonomy = {
  'Bank': ['Personal Banking', 'Mortgage Lenders', 'Credit Unions'],
  'Travel Insurance': ['International Travel', 'Student Travel', 'Business Travel'],
  'Retail': ['Fashion', 'Electronics', 'Furniture', 'Jewelry'],
  'Software': ['Productivity', 'Design Tools', 'Developer Tools', 'Marketing'],
  'Health': ['Clinics', 'Dental Services', 'Mental Health'],
  'Automotive': ['Dealers', 'Auto Repair', 'Car Rental'], 
  'Real Estate': ['Agencies', 'Property Management', 'Commercial'],
  'Education': ['Online Courses', 'Tutoring', 'Language Schools'],
  'Fitness': ['Gyms', 'Yoga Studios', 'Equipment'],
  'Pets': ['Pet Food', 'Vet Services', 'Pet Grooming'],
};

// [Name, Domain, Category, SubCategory, ImageKeyword]
const companiesData = [
  ['BankFive', 'bankfive.com', 'Bank', 'Personal Banking', 'bank'],
  ['AARDY', 'aardy.com', 'Travel Insurance', 'International Travel', 'travel'],
  ['ShopBefikar', 'shopbefikar.com', 'Retail', 'Fashion', 'clothing'],
  ['CloudHQ', 'cloudhq.net', 'Software', 'Productivity', 'cloud'],
  ['PlanetSpark', 'planetspark.in', 'Software', 'Productivity', 'art'], 
  ['CarVantage', 'carvantage.com', 'Automotive', 'Dealers', 'car'],
  ['Cadogan Clinic', 'cadoganclinic.com', 'Health', 'Clinics', 'doctor'],
  ['Alta Coaching', 'altaforlife.com', 'Health', 'Clinics', 'therapy'],
  ['Hotter Shoes', 'hotter.com', 'Retail', 'Fashion', 'shoes'],
  ['Wavlink', 'wavlink.com', 'Software', 'Productivity', 'wifi'],
  ['Capital One', 'capitalone.com', 'Bank', 'Credit Unions', 'credit card'],
  ['Chase', 'chase.com', 'Bank', 'Mortgage Lenders', 'money'],
  ['TechNova', 'technova.io', 'Retail', 'Electronics', 'gadget'],
  ['CozyHome', 'cozyhome.com', 'Retail', 'Furniture', 'sofa'],
  ['LuxeGems', 'luxegems.com', 'Retail', 'Jewelry', 'diamond'],
  ['DevFlow', 'devflow.io', 'Software', 'Developer Tools', 'code'],
  ['SmileBright', 'smilebright.com', 'Health', 'Dental Services', 'dentist'],
  ['SpeedyFix', 'speedyfix.com', 'Automotive', 'Auto Repair', 'mechanic'],
  ['Dream Homes', 'dreamhomes.com', 'Real Estate', 'Agencies', 'house'],
  ['Urban Living', 'urbanliving.com', 'Real Estate', 'Property Management', 'apartment'],
  ['CodeAcademy Pro', 'codeacademy.com', 'Education', 'Online Courses', 'student'],
  ['LinguaFranc', 'lingua.com', 'Education', 'Language Schools', 'book'],
  ['Iron Paradise', 'ironparadise.com', 'Fitness', 'Gyms', 'gym'],
  ['Zen Yoga', 'zenyoga.com', 'Fitness', 'Yoga Studios', 'yoga'],
  ['Paws & Claws', 'pawsclaws.com', 'Pets', 'Pet Food', 'dog'],
];

const reviewTemplates = [
  { rating: 5, title: "Absolutely amazing!", body: "The service exceeded my expectations. Highly recommended! I have been using them for years and they never disappoint." },
  { rating: 5, title: "Great experience", body: "Professional, timely, and very helpful staff. Will come back for sure. The attention to detail was impressive." },
  { rating: 4, title: "Very good", body: "Solid experience overall, just a minor delay in response time, but the final result was worth it." },
  { rating: 4, title: "Good value", body: "Worth the price, but there is room for improvement in the UI. Customer support was friendly." },
  { rating: 3, title: "It was okay", body: "Not bad, but not great either. Average service. I might try a competitor next time." },
  { rating: 2, title: "Disappointed", body: "The product quality was lower than expected based on the description. Shipping was fast though." },
  { rating: 1, title: "Terrible", body: "Avoid at all costs. Customer service was rude and unhelpful. I requested a refund immediately." },
];

async function main() {
  console.log('🌱 Starting Master Seeding...');

  // 1. CLEANUP
  console.log('🧹 Cleaning previous data...');
  try {
    await prisma.review.deleteMany();
    await prisma.company.deleteMany();
    await prisma.user.deleteMany();
    await prisma.subCategory.deleteMany();
    await prisma.category.deleteMany();
    // Optional: Clean up auxiliary tables if they exist
    // await prisma.helpfulVote.deleteMany();
    // await prisma.report.deleteMany();
  } catch (e) {
    console.log('Database empty or cleanup failed, continuing...');
  }

  // 2. CREATE USERS
  console.log('👤 Creating Users...');
  const createdUsers = [];

  // --- A. CREATE SUPER ADMIN ---
  const adminPassword = await bcrypt.hash("admin123", 10);
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@help.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@help.com",
      password: adminPassword,
      image: "https://ui-avatars.com/api/?name=Admin&background=000032&color=fff",
      role: "ADMIN" // <--- Important: This requires the Role enum in schema
    }
  });
  console.log("🛡️ Admin Created: admin@help.com / admin123");

  
  for (let i = 0; i < userNames.length; i++) {
    const user = await prisma.user.create({
      data: {
        name: userNames[i],
        email: `user${i}@example.com`,
        image: `https://i.pravatar.cc/150?u=${i + 1}`,
        country: i % 3 === 0 ? 'India' : (i % 2 === 0 ? 'USA' : 'UK'),
        gender: i % 2 === 0 ? 'Male' : 'Female',
      }
    });
    createdUsers.push(user);
  }

  // 3. CREATE CATEGORIES & SUBCATEGORIES
  const subCatMap = new Map(); 
  console.log('🗂️ Creating Taxonomy...');
  
  for (const [catName, subNames] of Object.entries(taxonomy)) {
    const category = await prisma.category.create({
      data: { 
        name: catName,
        slug: slugify(catName)
      },
    });

    for (const subName of subNames) {
      const sub = await prisma.subCategory.create({
        data: {
          name: subName,
          slug: slugify(subName),
          categoryId: category.id,
        }
      });
      subCatMap.set(`${catName}:${subName}`, { catId: category.id, subId: sub.id });
    }
  }

  // 4. CREATE COMPANIES
  console.log('🏢 Creating Companies...');
  const createdCompanies = [];

  for (const [name, url, cat, sub, keyword] of companiesData) {
    const ids = subCatMap.get(`${cat}:${sub}`);
    const imageId = getKeywordImageId(keyword);
    
    // Random data generation
    const loc = locations[Math.floor(Math.random() * locations.length)];
    const isClaimed = Math.random() < 0.6; // 60% chance
    const companyKeywords = generateKeywords(name, cat, sub, loc.city, loc.country);
    const longDescription = generateDescription(name, cat, sub, loc.city);

    // Prepare Data Object
    const companyData = {
        name: name,
        slug: slugify(name), 
        websiteUrl: url,
        logoImage: `https://images.unsplash.com/photo-${imageId}?q=80&w=200&auto=format&fit=crop`,
        briefIntroduction: longDescription,
        companyType: 'SERVICE' as const,
        keywords: companyKeywords,
        address: `123 Market St, ${loc.city}, ${loc.country}`,
        city: loc.city,
        country: loc.country,
        claimed: isClaimed,
        contact: { email: `support@${url}`, phone: '+1 (555) 000-0000' }
    };

    // Create Company
    if (ids) {
       const company = await prisma.company.create({
          data: {
              ...companyData,
              categoryId: ids.catId,
              subCategoryId: ids.subId,
          }
       });
       createdCompanies.push(company);
    } else {
       // Fallback if exact map missing
       const category = await prisma.category.findFirst({ 
          where: { slug: slugify(cat) }, 
          include: { subCategories: true }
       });
       
       if(category && category.subCategories.length > 0) {
          const company = await prisma.company.create({
             data: {
                 ...companyData,
                 categoryId: category.id,
                 subCategoryId: category.subCategories[0].id,
             }
          });
          createdCompanies.push(company);
       }
    }
  }

  // 5. GENERATE REVIEWS
  console.log('⭐ Generating Reviews...');
  let reviewCount = 0;

  for (const company of createdCompanies) {
    const numReviews = Math.floor(Math.random() * 4) + 2; 
    for (let i = 0; i < numReviews; i++) {
      const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const template = reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)];
      
      // Create distinct dates
      const experienceDate = new Date();
      experienceDate.setDate(experienceDate.getDate() - Math.floor(Math.random() * 90)); 
      
      const createDate = new Date(experienceDate);
      createDate.setDate(createDate.getDate() + Math.floor(Math.random() * 5));

      await prisma.review.create({
        data: {
          starRating: template.rating,
          reviewTitle: template.title,
          comment: template.body,
          dateOfExperience: experienceDate,
          createdAt: createDate, 
          userId: user.id,
          companyId: company.id,
          reads: Math.floor(Math.random() * 100), // Pre-fill reads
          keywords: ['service', 'staff', 'quality'] // Basic keywords for testing filters
        }
      });
      reviewCount++;
    }
  }

  console.log(`✅ Seeding Completed!`);
  console.log(`   - ${createdUsers.length} Users`);
  console.log(`   - ${createdCompanies.length} Companies`);
  console.log(`   - ${reviewCount} Reviews`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
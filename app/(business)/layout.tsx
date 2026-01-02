import { Header } from "@/components/layout/header"; // Import the refactored header
import { Footer } from "@/components/layout/Footer"; 
import { auth } from '@/auth'; 
import { prisma } from '@/lib/prisma';

export default async function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  // Logic to fetch user if logged in (same as main layout)
  let currentUser = session?.user;
  if (session?.user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, image: true }
    });
    if (dbUser) currentUser = { ...session.user, ...dbUser };
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* USE THE SHARED HEADER WITH BUSINESS VARIANT */}
      <Header user={currentUser} variant="business" />
      
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
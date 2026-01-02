import { SetPasswordForm } from "@/components/business_auth/set-password-form";
import { prisma } from "@/lib/prisma";
import { XCircle, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Set Password - Help Business" };

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  // 1. Basic Validation
  if (!token) {
    return <ErrorState message="Invalid link. No token provided." />;
  }

  // 2. Database Validation
  const invite = await prisma.inviteToken.findUnique({
    where: { token },
  });

  if (!invite || invite.expires < new Date()) {
    return <ErrorState message="This invitation link has expired or is invalid." />;
  }

  // 3. Render Success UI
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
       
       {/* Background Decor */}
       <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#0892A5] opacity-[0.08] rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
       <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#0892A5] opacity-[0.08] rounded-full blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2" />

       <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 md:p-10 relative z-10 border border-gray-100">
          
          <div className="mb-8 text-center">
             <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-xl mb-4">
                <Star className="h-8 w-8 text-[#000032] fill-current" />
             </div>
             <h1 className="text-2xl font-bold text-[#000032]">Welcome to Help!</h1>
             <p className="text-gray-500 mt-2 text-sm">
               Set a secure password to activate your dashboard for <br/>
               <span className="font-semibold text-[#000032]">{invite.email}</span>
             </p>
          </div>

          <SetPasswordForm token={token} />
       </div>
    </div>
  );
}

// Error Component for Invalid Tokens
function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
       <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Link Expired</h2>
          <p className="text-gray-500 mb-6">{message}</p>
          <Link href="/business/login">
             <Button variant="outline">Go to Login</Button>
          </Link>
       </div>
    </div>
  );
}
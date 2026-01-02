import { verifyDomainToken } from "@/lib/actions";
import { CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Domain Verification" };

export default async function VerifyDomainPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  
  if(!token) return <div className="p-10 text-center">Invalid Link</div>;

  const result = await verifyDomainToken(token);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full border border-gray-100">
        {result.success ? (
          <>
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-[#000032]">Domain Verified!</h1>
            <p className="text-gray-500 mt-2 mb-6 text-sm">
              We have successfully verified ownership for <strong>{result.companyName}</strong>.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in">
              <XCircle className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-[#000032]">Verification Failed</h1>
            <p className="text-gray-500 mt-2 mb-6 text-sm">This link is invalid or has expired.</p>
          </>
        )}
        
        <Link href="/business/dashboard">
          <Button className="w-full bg-[#000032] hover:bg-[#000032]/90 rounded-full">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
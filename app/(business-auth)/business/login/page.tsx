import { BusinessLoginForm } from "@/components/business_auth/business-login-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Business Login - Help",
  description: "Log in to manage your reviews and analytics.",
};

export default function BusinessLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      
      {/* Back Button */}
      <div className="absolute top-6 left-6">
        <Link href="/business">
          <Button variant="ghost" className="text-gray-500 hover:text-black gap-2 pl-2">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      {/* Centered Form Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
           <BusinessLoginForm />
        </div>
      </div>

    </div>
  );
}
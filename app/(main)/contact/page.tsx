"use client";

import { useState } from "react";
import { MessageSquare, Wrench, Building2, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContactModal, ContactType } from "@/components/contact_components/contact-forms";

const contactOptions = [
  {
    id: "review" as ContactType,
    title: "Reviews & Content",
    description:
      "Need help with a specific review, reporting fake content, or moderation issues?",
    icon: MessageSquare,
    colorClass: "text-orange-500 bg-white",
  },
  {
    id: "technical" as ContactType,
    title: "Technical Support",
    description:
      "Facing issues with account setup, login problems, or platform errors?",
    icon: Wrench,
    colorClass: "text-blue-500 bg-white",
  },
  {
    id: "business" as ContactType,
    title: "Business Inquiries",
    description:
      "Questions about partnerships, sales, API access, or enterprise solutions?",
    icon: Building2,
    colorClass: "text-purple-500 bg-white",
  },
];

export default function ContactPage() {
  const [openModalType, setOpenModalType] = useState<ContactType>(null);

  const handleOpenModal = (type: ContactType) => {
    setOpenModalType(type);
  };

  const handleCloseModal = () => {
    setOpenModalType(null);
  };

  return (
    <div className="bg-gray-50 py-24">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Get in touch with our team
          </h1>
          <p className="text-lg text-gray-600">
            We're here to help. Choose the category that best fits your inquiry
            so we can route you to the right experts.
          </p>
        </div>

        {/* 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {contactOptions.map((option) => (
            <Card
              key={option.id}
              className="relative group overflow-hidden flex flex-col"
            >
              <CardHeader>
                <div
                  className={`w-14 h-14  flex items-center justify-center mb-6 ${option.colorClass} transition-transform`}
                >
                  <option.icon className="h-10 w-10" />
                </div>
                <CardTitle className="text-xl">{option.title}</CardTitle>
                <CardDescription className="text-base mt-2">
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  className="w-full text-[#0ABED6] hover:text-[#09A8BD] hover:underline transition-all"
                  onClick={() => handleOpenModal(option.id)}
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2 opacity-70 group-hover:opacity-100 transition-opacity" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <ContactModal
        isOpen={openModalType !== null}
        onClose={handleCloseModal}
        type={openModalType}
      />
    </div>
  );
}
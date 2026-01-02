"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Gavel } from "lucide-react";
import { ReportActionModal } from "./report-action-modal";

export function ReportActionCell({ report }: { report: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setIsOpen(true)} className="bg-[#000032]">
         <Gavel className="h-4 w-4 mr-1" /> Decide
      </Button>
      <ReportActionModal isOpen={isOpen} setIsOpen={setIsOpen} report={report} />
    </>
  );
}
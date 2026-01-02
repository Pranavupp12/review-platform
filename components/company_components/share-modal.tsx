"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy } from "lucide-react"; // REMOVED 'X' from imports
import { useState } from "react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  shareUrl: string;
}

export function ShareModal({ isOpen, onClose, title, shareUrl }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          {/* REMOVED the div wrapper and the manual close button. 
              The DialogContent component adds a default X button automatically. */}
          <DialogTitle>Share this update</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <p className="text-sm text-gray-500">
            Share "<span className="font-medium text-gray-900">{title}</span>" with your network.
          </p>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Input
                readOnly
                defaultValue={shareUrl}
                className="h-9 bg-gray-50"
              />
            </div>
            <Button size="sm" onClick={handleCopy} className="px-3">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="sr-only">Copy</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
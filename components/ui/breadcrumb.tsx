// components/ui/breadcrumb.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav 
      className={cn("flex flex-wrap items-center space-x-2 text-md font-medium text-muted-foreground", className)} 
      aria-label="Breadcrumb"
    >
      {/* Home Icon */}
      <Link href="/" className="hover:text-foreground transition-colors flex items-center">
        <Home className="h-5 w-5" />
        <span className="sr-only">Home</span>
      </Link>

      {/* Dynamic Items */}
      {items.map((item) => (
        <React.Fragment key={item.href}>
          <ChevronRight className="h-5 w-5 " />
          {item.current ? (
            <span className="text-[#0892A5] font-semibold" aria-current="page">
              {item.label}
            </span>
          ) : (
            <Link href={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
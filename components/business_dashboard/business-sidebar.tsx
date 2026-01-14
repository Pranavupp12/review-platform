"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ChevronsUpDown,
  LayoutDashboard,
  LogOut,
  Star,
  BarChart3,
  Store,
  Megaphone,
  Settings,
  BellPlusIcon
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";

// --- ANIMATION VARIANTS ---
const sidebarVariants = {
  open: { width: "15rem" },
  closed: { width: "3.5rem" },
};

const contentVariants = {
  open: { display: "block", opacity: 1 },
  closed: { display: "block", opacity: 1 },
};

const variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: { x: { stiffness: 1000, velocity: -100 } },
  },
  closed: {
    x: -20,
    opacity: 0,
    transition: { x: { stiffness: 100 } },
  },
};

const transitionProps = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
  staggerChildren: 0.1,
} as const;

const staggerVariants = {
  open: {
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
};

// --- BUSINESS LINKS ---
const BUSINESS_LINKS = [
  { name: "Overview", href: "/business/dashboard", icon: LayoutDashboard },
  { name: "Reviews", href: "/business/dashboard/reviews", icon: Star },
  {name: "Business Updates", href:"/business/dashboard/updates", icon: BellPlusIcon},
  { name: "Analytics", href: "/business/dashboard/analytics", icon: BarChart3 },
  { name: "Marketing", href: "/business/dashboard/marketing", icon: Megaphone },
  { name: "Products & Services", href: "/business/dashboard/showcase", icon: Store },
  { name: "Edit Profile", href: "/business/dashboard/settings", icon: Settings },
];

export function BusinessSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();

  return (
    <motion.div
      className={cn(
        // Changed bg-gray-900 to your brand Navy #000032
        "fixed left-0 z-40 h-full shrink-0 border-r border-[#0ABED6]/20 bg-[#000032] text-blue-100",
      )}
      initial={isCollapsed ? "closed" : "open"}
      animate={isCollapsed ? "closed" : "open"}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <motion.div
        className={`relative z-40 flex h-full shrink-0 flex-col transition-all`}
        variants={contentVariants}
      >
        <motion.ul variants={staggerVariants} className="flex h-full flex-col">
          <div className="flex grow flex-col items-center">

            {/* Header / Profile Dropdown */}
            <div className="flex h-[60px] w-full shrink-0 items-center border-b border-white/10 p-2">
              <div className="flex w-full">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="w-full" asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex w-full justify-start items-center gap-2 px-2 hover:bg-white/10 hover:text-white"
                    >
                      <Avatar className='rounded size-6 bg-[#0ABED6]'>
                        <AvatarFallback className="text-[#000032] font-bold">B</AvatarFallback>
                      </Avatar>
                      <motion.li
                        variants={variants}
                        className="flex items-center gap-2 overflow-hidden"
                      >
                        {!isCollapsed && (
                          <>
                            <div className="flex flex-col items-start text-left">
                              <p className="text-sm font-bold text-white">My Business</p>
                              <p className="text-[10px] text-blue-300">Owner</p>
                            </div>
                            <ChevronsUpDown className="ml-auto h-4 w-4 text-gray-500" />
                          </>
                        )}
                      </motion.li>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 bg-[#000032] border-[#0ABED6]/30 text-blue-100">
                    <DropdownMenuItem
                      className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-red-400 focus:text-red-400"
                      onClick={() => signOut({ callbackUrl: '/business/login' })}
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex h-full w-full flex-col pt-4">
              <div className="flex grow flex-col gap-2 px-2">
                {/* Map through the links array */}
                {BUSINESS_LINKS.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={cn(
                        "flex h-10 w-full flex-row items-center rounded-md px-2 transition-all",
                        isActive
                          ? "bg-[#0ABED6] text-white shadow-md shadow-[#0ABED6]/20"
                          : "hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <link.icon className="h-5 w-5 shrink-0" />
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <p className="ml-3 text-sm font-medium">{link.name}</p>
                        )}
                      </motion.li>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.ul>
      </motion.div>
    </motion.div>
  );
}
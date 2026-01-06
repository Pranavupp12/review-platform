"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ChevronsUpDown,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Building2,
  Settings,
  ShieldAlert,
  LifeBuoy,
  VerifiedIcon,
  List,
  Newspaper,
  Crown,
  Users,
  ShieldCheck,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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

// ✅ UPDATED LINKS: Defined separate access for DATA_ENTRY and BLOG_ENTRY
const ADMIN_LINKS = [
  { 
    name: "Overview", 
    href: "/admin", 
    icon: LayoutDashboard,
    roles: ["ADMIN", "DATA_ENTRY", "BLOG_ENTRY"] // All roles see dashboard
  },
  { 
    name: "Companies", 
    href: "/admin/companies", 
    icon: Building2, 
    roles: ["ADMIN", "DATA_ENTRY"] // Only Data Entry & Admin
  },
  { 
    name: "Blog Management", 
    href: "/admin/blogs", 
    icon: Newspaper,
    roles: ["ADMIN", "BLOG_ENTRY"] // Only Blog Entry & Admin
  },
  { 
    name: "Manage Staff", 
    href: "/admin/staff", 
    icon: Users,
    roles: ["ADMIN"] 
  },
  { 
    name: "Reviews", 
    href: "/admin/reviews", 
    icon: MessageSquare,
    roles: ["ADMIN"]
  },
  { 
    name: "Reports", 
    href: "/admin/reports", 
    icon: ShieldAlert,
    roles: ["ADMIN"]
  },
  { 
    name: 'Support Inbox',
    href: '/admin/support',
    icon: LifeBuoy,
    roles: ["ADMIN"]
  },
  { 
    name: "Claims",
    href:"/admin/claims",
    icon:VerifiedIcon,
    roles: ["ADMIN"]
  },
  { 
    name: "Categories",
    href:"/admin/categories",
    icon:List,
    roles: ["ADMIN"]
  },
  { 
    name: "Manage Plans",
    href:"/admin/plans",
    icon:Crown,
    roles: ["ADMIN"]
  },
  { 
    name: "Data Approval", 
    href: "/admin/data-approval", 
    icon: ShieldCheck, 
    roles: ["ADMIN"] 
  },
];

interface AdminSidebarProps {
  userRole?: string;
  userName?: string;
}

export function AdminSidebar({ userRole = "DATA_ENTRY", userName = "Admin" }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();

  // Filter links based on role
  const visibleLinks = ADMIN_LINKS.filter(link => link.roles.includes(userRole));

  // Helper to determine display role label
  const getRoleLabel = (role: string) => {
    if (role === "ADMIN") return "Super Admin";
    if (role === "DATA_ENTRY") return "Data Specialist";
    if (role === "BLOG_ENTRY") return "Content Writer";
    return "Staff Member";
  };

  return (
    <motion.div
      className={cn(
        "fixed left-0 z-40 h-full shrink-0 border-r bg-gray-900 text-gray-300",
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
            <div className="flex h-[60px] w-full shrink-0 items-center border-b border-gray-800 p-2">
              <div className="flex w-full">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="w-full" asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex w-full justify-start items-center gap-2 px-2 hover:bg-gray-800 hover:text-white"
                    >
                      <Avatar className='rounded size-6 bg-[#0ABED6]'>
                        <AvatarFallback className="text-black font-bold">
                           {userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <motion.li
                        variants={variants}
                        className="flex items-center gap-2 overflow-hidden"
                      >
                        {!isCollapsed && (
                          <>
                            <div className="flex flex-col items-start text-left">
                              <p className="text-sm font-bold text-white truncate max-w-[110px]">{userName}</p>
                              <p className="text-[10px] text-gray-500">
                                {getRoleLabel(userRole)}
                              </p>
                            </div>
                            <ChevronsUpDown className="ml-auto h-4 w-4 text-gray-500" />
                          </>
                        )}
                      </motion.li>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 bg-gray-900 border-gray-800 text-gray-300">
                    <DropdownMenuItem
                      className="hover:bg-gray-800 focus:bg-gray-800 cursor-pointer text-red-400 focus:text-red-400"
                      onClick={() => signOut({ callbackUrl: '/admin/login' })}
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
                {visibleLinks.map((link) => {
                  
                  // ✅ FIX: DYNAMIC HREF REWRITING
                  let href = link.href;

                  if (userRole === 'DATA_ENTRY') {
                    // Rewrite /admin/companies -> /data-entry/companies
                    href = href.replace('/admin', '/data-entry');
                    if (href === '/data-entry') href = '/data-entry'; // Handle dashboard root
                  } 
                  else if (userRole === 'BLOG_ENTRY') {
                    // Rewrite /admin/blogs -> /blog-entry/blogs
                    href = href.replace('/admin', '/blog-entry');
                    if (href === '/blog-entry') href = '/blog-entry'; // Handle dashboard root
                  }

                  const isActive = pathname === href;

                  return (
                    <Link
                      key={link.name}
                      href={href}
                      className={cn(
                        "flex h-10 w-full flex-row items-center rounded-md px-2 transition-all",
                        isActive
                          ? "bg-[#0ABED6] text-white shadow-md"
                          : "hover:bg-gray-800 hover:text-white"
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

              {/* Bottom Settings Link (Only for Admin) */}
              {userRole === "ADMIN" && (
                <div className="p-2 border-t border-gray-800 mt-auto">
                  <Link
                    href="/admin/settings"
                    className="flex h-10 w-full flex-row items-center rounded-md px-2 transition hover:bg-gray-800 hover:text-white"
                  >
                    <Settings className="h-5 w-5 shrink-0" />
                    <motion.li variants={variants}>
                      {!isCollapsed && (
                        <p className="ml-3 text-sm font-medium">Settings</p>
                      )}
                    </motion.li>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.ul>
      </motion.div>
    </motion.div>
  );
}
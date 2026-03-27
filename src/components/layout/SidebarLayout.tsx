"use client";

import { motion } from "framer-motion";
import { fadeIn, slideRight } from "@/lib/motion";

interface SidebarLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  sidebarWidth?: string;
}

export function SidebarLayout({
  sidebar,
  children,
  sidebarWidth = "w-80",
}: SidebarLayoutProps) {
  return (
    <div className="min-h-screen pt-16 flex">
      {/* Fixed Sidebar */}
      <motion.aside
        variants={slideRight}
        initial="initial"
        animate="animate"
        className={`
          ${sidebarWidth} shrink-0
          fixed top-16 left-0 bottom-0
          border-r border-gray-border/50
          bg-white/60 backdrop-blur-md
          overflow-y-auto overscroll-contain
          hidden lg:block
        `}
      >
        <div className="p-6 space-y-6">{sidebar}</div>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className={`flex-1 lg:ml-80 min-h-[calc(100vh-4rem)]`}
      >
        {children}
      </motion.main>
    </div>
  );
}

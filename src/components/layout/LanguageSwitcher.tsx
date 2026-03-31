"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";

export function LanguageSwitcher() {
  const { lang, toggleLang, mounted } = useTranslation();

  // Prevent hydration mismatch layout shift by rendering a skeleton or hidden until mounted
  if (!mounted) {
    return (
      <div className="w-[72px] h-[34px] rounded-full bg-gray-light/30 border border-gray-border animate-pulse" />
    );
  }

  return (
    <button
      onClick={toggleLang}
      className={`
        relative flex items-center justify-between
        w-[72px] h-[34px] p-1 rounded-full text-micro font-bold
        transition-colors duration-300
        ${lang === "th" ? "bg-red/10 border-red/20 shadow-[0_0_12px_rgba(230,0,0,0.1)]" : "bg-gray-light/50 hover:bg-gray-light"}
        border border-gray-border/50
        focus:outline-none focus:ring-2 focus:ring-red/50
      `}
      aria-label="Toggle language"
    >
      {/* Sliding pill background */}
      <motion.div
        className="absolute top-1 bottom-1 w-[32px] bg-white rounded-full shadow-sm"
        animate={{
          left: lang === "en" ? 4 : 34,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
      
      <span
        className={`relative z-10 w-1/2 text-center transition-colors duration-300 ${
          lang === "en" ? "text-red" : "text-gray-muted hover:text-gray"
        }`}
      >
        EN
      </span>
      <span
        className={`relative z-10 w-1/2 text-center transition-colors duration-300 ${
          lang === "th" ? "text-red" : "text-gray-muted hover:text-gray"
        }`}
      >
        TH
      </span>
    </button>
  );
}

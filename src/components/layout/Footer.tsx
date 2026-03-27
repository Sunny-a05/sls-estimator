"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { blurFadeUp, stagger, viewportEager, ease } from "@/lib/motion";

const FOOTER_LINKS = [
  { href: "/configure", label: "Configure" },
  { href: "/materials", label: "Materials" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <motion.footer
      initial="initial"
      whileInView="animate"
      viewport={viewportEager}
      variants={stagger(0.1, 0.1)}
      className="border-t border-gray-border/50 bg-white/80 backdrop-blur-sm relative z-10"
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
          {/* Brand */}
          <motion.div variants={blurFadeUp} className="space-y-2">
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={viewportEager}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 15,
                  delay: 0.2,
                }}
                className="w-6 h-6 bg-red rounded-lg flex items-center justify-center"
              >
                <span className="text-white text-[9px] font-bold">SLS</span>
              </motion.div>
              <span className="font-serif text-body font-semibold text-black">
                Estimator
              </span>
            </div>
            <p className="text-caption text-gray-muted max-w-xs leading-relaxed">
              Precision SLS print estimation for the Formlabs Fuse 1+ ecosystem.
            </p>
          </motion.div>

          {/* Links — staggered */}
          <motion.nav
            variants={stagger(0.06, 0.3)}
            className="flex gap-6"
          >
            {FOOTER_LINKS.map((link) => (
              <motion.div key={link.href} variants={blurFadeUp}>
                <Link
                  href={link.href}
                  className="text-caption text-gray hover:text-black transition-colors duration-200"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </motion.nav>
        </div>

        {/* Divider — draw animation */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={viewportEager}
          transition={{ duration: 1.0, ease: ease.cinematic, delay: 0.4 }}
          className="mt-8 pt-6 h-px bg-gray-border/30 origin-left"
        />

        <motion.p
          variants={blurFadeUp}
          className="mt-6 text-micro text-gray-muted"
          suppressHydrationWarning
        >
          &copy; {new Date().getFullYear()} SLS Estimator. Calibrated for Formlabs Fuse 1+.
        </motion.p>
      </div>
    </motion.footer>
  );
}

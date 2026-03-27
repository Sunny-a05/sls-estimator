"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ease } from "@/lib/motion";

const NAV_LINKS = [
  { href: "/configure", label: "Configure" },
  { href: "/materials", label: "Materials" },
  { href: "/contact", label: "Contact" },
];

const linkVariants = {
  initial: { opacity: 0, y: -8, filter: "blur(4px)" },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      delay: 0.6 + i * 0.07,
      ease: ease.cinematic,
    },
  }),
};

const logoVariants = {
  initial: { opacity: 0, scale: 0.5, rotate: -20 },
  animate: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 15,
      delay: 0.2,
    },
  },
};

const nameVariants = {
  initial: { opacity: 0, x: -10, filter: "blur(6px)" },
  animate: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, delay: 0.4, ease: ease.cinematic },
  },
};

const ctaVariants = {
  initial: { opacity: 0, scale: 0.8, filter: "blur(6px)" },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.5, delay: 1.0, ease: ease.cinematic },
  },
};

export function Navbar() {
  const pathname = usePathname();
  const isOnWizard = pathname === "/wizard" || pathname === "/configure";
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.nav
        initial={{ y: -30, opacity: 0, filter: "blur(8px)" }}
        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: ease.cinematic }}
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-500 ease-smooth
          ${scrolled || mobileOpen
            ? "bg-white/80 backdrop-blur-xl border-b border-gray-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            : "bg-transparent"
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo — spring pop */}
          <Link href="/" className="flex items-center gap-2 group" onClick={() => setMobileOpen(false)}>
            <motion.div
              variants={logoVariants}
              initial="initial"
              animate="animate"
              className="w-7 h-7 bg-red rounded-lg flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <span className="text-white text-micro font-bold">SLS</span>
            </motion.div>
            <motion.span
              variants={nameVariants}
              initial="initial"
              animate="animate"
              className="font-serif text-body font-semibold text-black hidden sm:inline"
            >
              Estimator
            </motion.span>
          </Link>

          {/* Desktop Links — staggered reveal */}
          <div className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.href}
                variants={linkVariants}
                initial="initial"
                animate="animate"
                custom={i}
              >
                <Link
                  href={link.href}
                  className={`
                    relative px-3 py-1.5 rounded-lg text-caption font-medium
                    transition-colors duration-200 group/link
                    ${pathname === link.href
                      ? "text-black"
                      : "text-gray hover:text-black"
                    }
                  `}
                >
                  {link.label}
                  {/* Active underline */}
                  {pathname === link.href ? (
                    <span className="absolute bottom-0 left-3 right-3 h-[1.5px] bg-red rounded-full" />
                  ) : (
                    <span className="absolute bottom-0 left-3 right-3 h-[1.5px] bg-red/30 scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
                  )}
                </Link>
              </motion.div>
            ))}

            {/* CTA — hidden when already on wizard */}
            {!isOnWizard && (
              <motion.div
                variants={ctaVariants}
                initial="initial"
                animate="animate"
              >
                <Link
                  href="/configure"
                  className="
                    ml-2 px-4 py-2 rounded-xl
                    bg-red text-white text-caption font-bold
                    hover:bg-red-dark active:scale-[0.97]
                    transition-all duration-200
                    shadow-btn hover:shadow-btn-hover
                  "
                >
                  Start Job
                </Link>
              </motion.div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden flex flex-col items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-light/50 transition-colors"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <motion.span
              animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="block w-5 h-[1.5px] bg-black mb-[5px] origin-center"
              transition={{ duration: 0.3 }}
            />
            <motion.span
              animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              className="block w-5 h-[1.5px] bg-black mb-[5px]"
              transition={{ duration: 0.2 }}
            />
            <motion.span
              animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="block w-5 h-[1.5px] bg-black origin-center"
              transition={{ duration: 0.3 }}
            />
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: ease.cinematic }}
            className="fixed inset-x-0 top-16 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-border/50 shadow-lg sm:hidden"
          >
            <div className="px-6 py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    block px-4 py-3 rounded-xl text-body font-medium transition-colors duration-200
                    ${pathname === link.href
                      ? "bg-red/[0.04] text-red border border-red/20"
                      : "text-gray hover:text-black hover:bg-gray-light/50"
                    }
                  `}
                >
                  {link.label}
                </Link>
              ))}

              {!isOnWizard && (
                <Link
                  href="/configure"
                  onClick={() => setMobileOpen(false)}
                  className="block mt-3 px-4 py-3 rounded-xl bg-red text-white text-body font-bold text-center hover:bg-red-dark active:scale-[0.98] transition-all duration-200 shadow-btn"
                >
                  Start Job
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

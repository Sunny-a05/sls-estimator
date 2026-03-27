"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  blurFadeUp,
  blurFadeIn,
  wordStagger,
  wordReveal,
  charReveal,
  stagger,
  ease,
} from "@/lib/motion";

/** Split text into words, preserving spaces as separate motion elements */
function AnimatedWords({
  text,
  className = "",
  wordClassName = "",
}: {
  text: string;
  className?: string;
  wordClassName?: string;
}) {
  const words = text.split(" ");
  return (
    <motion.span
      variants={wordStagger(0.07, 0.3)}
      className={`inline-flex flex-wrap justify-center ${className}`}
      style={{ perspective: "600px" }}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          variants={wordReveal}
          className={`inline-block mr-[0.3em] ${wordClassName}`}
          style={{ transformOrigin: "bottom center" }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

/** Animate tagline characters one by one */
function AnimatedChars({ text, className = "" }: { text: string; className?: string }) {
  return (
    <motion.span
      variants={stagger(0.02, 0.1)}
      className={`inline-flex ${className}`}
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          variants={charReveal}
          className="inline-block"
          style={char === " " ? { width: "0.35em" } : undefined}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

export function Hero() {
  return (
    <motion.section
      variants={stagger(0.15, 0.05)}
      initial="initial"
      animate="animate"
      className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 pt-24 pb-16"
    >
      {/* Tagline — char by char reveal */}
      <motion.p
        variants={stagger(0.02, 0.1)}
        initial="initial"
        animate="animate"
        className="text-micro uppercase tracking-[0.25em] text-gray-muted font-semibold mb-6"
      >
        <AnimatedChars text="SLS PRINT ESTIMATION" />
      </motion.p>

      {/* Title — word by word with 3D perspective */}
      <motion.h1
        variants={wordStagger(0.08, 0.4)}
        initial="initial"
        animate="animate"
        className="font-serif text-display text-black text-center max-w-3xl leading-[1.1] mb-5"
        style={{ perspective: "800px" }}
      >
        <AnimatedWords text="Precision quotes for" />
        <motion.span
          variants={wordReveal}
          className="inline-block text-red ml-[0.3em]"
          style={{ transformOrigin: "bottom center" }}
        >
          every
        </motion.span>{" "}
        <motion.span
          variants={wordReveal}
          className="inline-block text-red"
          style={{ transformOrigin: "bottom center" }}
        >
          build
        </motion.span>
      </motion.h1>

      {/* Subtitle — blur fade up */}
      <motion.p
        variants={blurFadeUp}
        className="text-body-lg text-gray text-center max-w-xl mb-14 leading-relaxed"
      >
        Configure your SLS print job and get an instant cost &amp; time estimate
        calibrated to the Formlabs Fuse&nbsp;1+.
      </motion.p>

      {/* CTA Button — dramatic entrance */}
      <motion.div variants={blurFadeIn}>
        <Link
          href="/configure"
          className="
            inline-flex items-center gap-3
            px-10 py-4 rounded-2xl
            bg-red text-white text-body-lg font-bold
            hover:bg-red-dark active:scale-[0.97]
            transition-all duration-300
            shadow-btn hover:shadow-btn-hover
          "
        >
          Start New Print Job
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </motion.div>

      {/* Supported formats hint */}
      <motion.p
        variants={blurFadeUp}
        className="mt-6 text-micro text-gray-muted/60"
      >
        Upload STL · OBJ · PLY · 3MF in the configurator
      </motion.p>

      {/* Scroll indicator — breathing pulse */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 2.0, ease: ease.cinematic }}
        className="mt-auto pt-12"
      >
        <motion.div
          animate={{ y: [0, 8, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: ease.smooth,
          }}
          className="w-5 h-8 rounded-full border-2 border-gray-muted/30 flex justify-center pt-1.5"
        >
          <motion.div
            animate={{ height: ["6px", "12px", "6px"] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: ease.smooth,
            }}
            className="w-1 rounded-full bg-gray-muted/40"
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

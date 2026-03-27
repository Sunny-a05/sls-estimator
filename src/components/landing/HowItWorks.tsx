"use client";

import { motion } from "framer-motion";
import {
  blurFadeUp,
  numberReveal,
  drawLine,
  stagger,
  wordStagger,
  wordReveal,
  viewportOnce,
  ease,
} from "@/lib/motion";

const STEPS = [
  {
    num: "01",
    title: "Upload Your Part",
    description: "Drop your 3D file — STL, OBJ, PLY, or 3MF — into the configurator. We parse geometry, detect units, and compute volume instantly.",
  },
  {
    num: "02",
    title: "Configure Your Job",
    description: "Set quantity, choose purpose, and select a color. The configurator auto-checks fit against the Fuse 1+ chamber in all 6 orientations.",
  },
  {
    num: "03",
    title: "Get Your Estimate",
    description: "Receive a detailed time and cost breakdown — calibrated against real builds with less than 5% error. Save, download, or email the results.",
  },
  {
    num: "04",
    title: "Request a Quote",
    description: "Submit your configuration for an official quote. Our team will review and follow up with final pricing.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-section bg-cream relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={viewportOnce}
          variants={stagger(0.12, 0.05)}
          className="text-center mb-16"
        >
          {/* Tagline with char-level stagger */}
          <motion.p
            variants={blurFadeUp}
            className="text-micro uppercase tracking-[0.25em] text-gray-muted font-semibold mb-3"
          >
            How It Works
          </motion.p>

          {/* Heading with word-by-word reveal */}
          <motion.h2
            variants={wordStagger(0.08, 0.15)}
            initial="initial"
            whileInView="animate"
            viewport={viewportOnce}
            className="font-serif text-heading text-black inline-flex flex-wrap justify-center"
            style={{ perspective: "600px" }}
          >
            {"From file to quote in four steps".split(" ").map((word, i) => (
              <motion.span
                key={`${word}-${i}`}
                variants={wordReveal}
                className="inline-block mr-[0.3em]"
                style={{ transformOrigin: "bottom center" }}
              >
                {word}
              </motion.span>
            ))}
          </motion.h2>
        </motion.div>

        {/* Decorative line */}
        <motion.div
          variants={drawLine}
          initial="initial"
          whileInView="animate"
          viewport={viewportOnce}
          className="h-px bg-gradient-to-r from-transparent via-red/20 to-transparent mb-16"
        />

        {/* Steps grid */}
        <motion.div
          variants={stagger(0.2, 0.15)}
          initial="initial"
          whileInView="animate"
          viewport={viewportOnce}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-14"
        >
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              variants={stagger(0.1, i * 0.15)}
              initial="initial"
              whileInView="animate"
              viewport={viewportOnce}
              className="flex gap-6 group"
            >
              {/* Number — dramatic reveal */}
              <div className="shrink-0 relative">
                <motion.span
                  variants={numberReveal}
                  className="font-serif text-display text-red/10 font-bold leading-none block"
                  style={{ perspective: "400px" }}
                >
                  {step.num}
                </motion.span>

                {/* Animated dot accent */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={viewportOnce}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 15,
                    delay: 0.4 + i * 0.15,
                  }}
                  className="absolute -bottom-1 right-0 w-2 h-2 rounded-full bg-red/30"
                />
              </div>

              {/* Content */}
              <div className="pt-2 space-y-2">
                <motion.h3
                  variants={blurFadeUp}
                  className="text-body font-bold text-black"
                >
                  {step.title}
                </motion.h3>

                <motion.p
                  variants={blurFadeUp}
                  className="text-caption text-gray leading-relaxed"
                >
                  {step.description}
                </motion.p>

                {/* Reveal underline */}
                <motion.div
                  initial={{ scaleX: 0, opacity: 0 }}
                  whileInView={{ scaleX: 1, opacity: 1 }}
                  viewport={viewportOnce}
                  transition={{
                    duration: 0.8,
                    ease: ease.cinematic,
                    delay: 0.6 + i * 0.15,
                  }}
                  className="h-px bg-red/10 origin-left mt-3"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

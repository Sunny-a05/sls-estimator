"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { FeatureStrip } from "@/components/landing/FeatureStrip";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PixelCanvas } from "@/components/shared/PixelCanvas";

export default function Home() {
  return (
    <>
      {/* Full-page powder particle background */}
      <PixelCanvas />

      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <FeatureStrip />
          <HowItWorks />
        </main>
        <Footer />
      </div>
    </>
  );
}

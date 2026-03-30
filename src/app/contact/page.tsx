"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fadeUp, blurFadeUp, stagger } from "@/lib/motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useWizardStore } from "@/stores/wizard-store";
import { useViewerStore } from "@/stores/viewer-store";

interface ContactFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  // Auto-filled job data
  dimensions: string;
  volume: string;
  quantity: number;
  printer: string;
  material: string;
  purpose: string;
  priority: string;
  color: string;
  notes: string;
  file_name: string;
}

type SubmitState = "idle" | "loading" | "success" | "error";

export default function ContactPage() {
  const store = useWizardStore();
  const viewer = useViewerStore();
  const hasJobData = store.x > 0 && store.y > 0 && store.z > 0;
  const hasQuote = !!store.estimatedCost;

  const [form, setForm] = useState<ContactFormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    subject: hasJobData ? "Quote Request" : "General Inquiry",
    message: "",
    dimensions: hasJobData ? `${store.x.toFixed(1)} × ${store.y.toFixed(1)} × ${store.z.toFixed(1)} mm` : "",
    volume: store.vol > 0 ? (store.vol > 1e6 ? `${(store.vol / 1e6).toFixed(2)} cm³` : `${store.vol.toFixed(1)} mm³`) : "",
    quantity: store.qty || 1,
    printer: store.selectedPrinter?.name || "",
    material: store.materialMatch?.name || "Nylon 12",
    purpose: store.purpose || "",
    priority: store.priority || "",
    color: store.color || "",
    notes: store.notes || "",
    file_name: viewer.fileName || "",
  });

  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name || !form.email) return;

    setSubmitState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/submit-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          estimated_cost: store.estimatedCost || "",
          estimated_time: store.estimatedTime || "",
          estimated_builds: store.estimatedBuilds || 0,
          issue_types: [],
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Submission failed.");
      setSubmitState("success");
    } catch (err: unknown) {
      setSubmitState("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const update = (field: keyof ContactFormData, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        <motion.section
          variants={stagger(0.1, 0.1)}
          initial="initial"
          animate="animate"
          className="py-section px-6"
        >
          <div className="max-w-2xl mx-auto">
            <motion.div variants={blurFadeUp} className="text-center mb-12">
              <p className="text-micro uppercase tracking-[0.25em] text-gray-muted font-semibold mb-4">
                Get in Touch
              </p>
              <h1 className="font-serif text-heading text-black mb-4">Contact Support</h1>
              <p className="text-body-lg text-gray">
                Have a question or need a custom quote? Fill out the form below and we&apos;ll get back to you.
              </p>
            </motion.div>

            {submitState === "success" ? (
              <motion.div variants={fadeUp} className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="font-serif text-xl font-bold text-black mb-2">Message Sent!</h2>
                <p className="text-body text-gray mb-6">We&apos;ll get back to you as soon as possible.</p>
                <button
                  onClick={() => setSubmitState("idle")}
                  className="px-6 py-2.5 rounded-xl bg-red text-white text-caption font-bold hover:bg-red-dark transition-colors"
                >
                  Send Another
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-micro font-semibold text-gray-muted uppercase tracking-widest mb-1.5">
                      First Name <span className="text-red">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={form.first_name}
                      onChange={(e) => update("first_name", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-border bg-white text-body text-black placeholder:text-gray-muted focus:outline-none focus:ring-2 focus:ring-red/20 focus:border-red transition-colors"
                      placeholder="Somchai"
                    />
                  </div>
                  <div>
                    <label className="block text-micro font-semibold text-gray-muted uppercase tracking-widest mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={form.last_name}
                      onChange={(e) => update("last_name", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-border bg-white text-body text-black placeholder:text-gray-muted focus:outline-none focus:ring-2 focus:ring-red/20 focus:border-red transition-colors"
                      placeholder="Jaidee"
                    />
                  </div>
                </motion.div>

                {/* Email + Phone */}
                <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-micro font-semibold text-gray-muted uppercase tracking-widest mb-1.5">
                      Email <span className="text-red">*</span>
                    </label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-border bg-white text-body text-black placeholder:text-gray-muted focus:outline-none focus:ring-2 focus:ring-red/20 focus:border-red transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-micro font-semibold text-gray-muted uppercase tracking-widest mb-1.5">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-border bg-white text-body text-black placeholder:text-gray-muted focus:outline-none focus:ring-2 focus:ring-red/20 focus:border-red transition-colors"
                      placeholder="0X-XXXX-XXXX"
                    />
                  </div>
                </motion.div>

                {/* Subject */}
                <motion.div variants={fadeUp}>
                  <label className="block text-micro font-semibold text-gray-muted uppercase tracking-widest mb-1.5">
                    Subject
                  </label>
                  <select
                    value={form.subject}
                    onChange={(e) => update("subject", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-border bg-white text-body text-black focus:outline-none focus:ring-2 focus:ring-red/20 focus:border-red transition-colors"
                  >
                    <option>General Inquiry</option>
                    <option>Quote Request</option>
                    <option>Technical Support</option>
                    <option>Material Question</option>
                    <option>Feedback</option>
                  </select>
                </motion.div>

                {/* Job data summary (auto-filled if available) */}
                {hasJobData && (
                  <motion.div variants={fadeUp} className="bg-cream border border-gray-border/30 rounded-2xl p-5">
                    <h3 className="text-micro uppercase tracking-widest text-gray-muted font-bold mb-3">
                      Attached Job Data
                    </h3>
                    {hasQuote && (
                      <div className="mb-3 pb-3 border-b border-gray-border/30 grid grid-cols-2 gap-x-6 gap-y-1.5 text-caption">
                        <span className="text-gray">Estimated Cost</span>
                        <span className="font-bold text-red">{store.estimatedCost}</span>
                        <span className="text-gray">Estimated Time</span>
                        <span className="font-semibold text-black">{store.estimatedTime}</span>
                        <span className="text-gray">Builds</span>
                        <span className="font-semibold text-black">{store.estimatedBuilds}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-caption">
                      <span className="text-gray">Dimensions</span>
                      <span className="font-semibold text-black">{form.dimensions}</span>
                      {form.volume && (
                        <>
                          <span className="text-gray">Volume</span>
                          <span className="font-semibold text-black">{form.volume}</span>
                        </>
                      )}
                      <span className="text-gray">Quantity</span>
                      <span className="font-semibold text-black">{form.quantity}</span>
                      {form.printer && (
                        <>
                          <span className="text-gray">Printer</span>
                          <span className="font-semibold text-black">{form.printer}</span>
                        </>
                      )}
                      {form.material && (
                        <>
                          <span className="text-gray">Material</span>
                          <span className="font-semibold text-black">{form.material}</span>
                        </>
                      )}
                      {form.purpose && (
                        <>
                          <span className="text-gray">Purpose</span>
                          <span className="font-semibold text-black">{form.purpose}</span>
                        </>
                      )}
                      {form.color && (
                        <>
                          <span className="text-gray">Color</span>
                          <span className="font-semibold text-black">{form.color}</span>
                        </>
                      )}
                      {form.file_name && (
                        <>
                          <span className="text-gray">File</span>
                          <span className="font-semibold text-black">{form.file_name}</span>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Message */}
                <motion.div variants={fadeUp}>
                  <label className="block text-micro font-semibold text-gray-muted uppercase tracking-widest mb-1.5">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-border bg-white text-body text-black placeholder:text-gray-muted focus:outline-none focus:ring-2 focus:ring-red/20 focus:border-red transition-colors resize-none"
                    placeholder="Tell us about your project or question..."
                  />
                </motion.div>

                {submitState === "error" && (
                  <div className="bg-red/5 border border-red/20 rounded-xl px-4 py-3 text-caption text-red">
                    {errorMsg}
                  </div>
                )}

                <motion.div variants={fadeUp}>
                  <button
                    type="submit"
                    disabled={submitState === "loading"}
                    className="w-full py-3 rounded-xl text-body font-bold bg-red text-white hover:bg-red-dark disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-200 shadow-btn"
                  >
                    {submitState === "loading" ? "Sending..." : "Send Message"}
                  </button>
                </motion.div>
              </form>
            )}
          </div>
        </motion.section>
      </main>
      <Footer />
    </>
  );
}

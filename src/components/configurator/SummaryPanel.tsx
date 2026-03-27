"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ease } from "@/lib/motion";
import type { EstimatorResult } from "@/types/estimator";

interface SummaryPanelProps {
  store: {
    x: number;
    y: number;
    z: number;
    vol: number;
    qty: number;
    purpose: string;
    color: string;
    priority: string;
    notes: string;
    selectedPrinter: { name: string } | null;
    materialMatch: { name: string } | null;
  };
  result: EstimatorResult;
  orientLabel: string;
  volDisplay: string | null;
  fmtTime: (min: number) => string;
  fmtTHB: (v: number) => string;
  onClose: () => void;
}

interface ContactForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  message: string;
  will_attach_file: boolean;
}

type SubmitState = "idle" | "loading" | "success" | "error";

const EMPTY_FORM: ContactForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  message: "",
  will_attach_file: false,
};

export function SummaryPanel({
  store, result, orientLabel, volDisplay, fmtTime, fmtTHB, onClose,
}: SummaryPanelProps) {
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name || !form.last_name || !form.email) return;

    setSubmitState("loading");
    setErrorMsg("");

    const payload = {
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      phone: form.phone,
      message: form.message,
      will_attach_file: form.will_attach_file,
      file_name: `${store.x.toFixed(0)}x${store.y.toFixed(0)}x${store.z.toFixed(0)}mm`,
      dimensions: `${store.x.toFixed(1)} × ${store.y.toFixed(1)} × ${store.z.toFixed(1)} mm`,
      volume_cm3: store.vol > 0 ? (store.vol / 1000).toFixed(3) : "0",
      quantity: store.qty,
      printer: store.selectedPrinter?.name ?? "Fuse 1+ 30W",
      material: store.materialMatch?.name ?? "Nylon 12",
      estimated_cost: fmtTHB(result.finalQuote),
      estimated_time: fmtTime(result.totalMinAll),
      builds: result.builds,
      job_notes: [store.purpose, store.color && `Color: ${store.color}`, store.priority && `Priority: ${store.priority}`, store.notes]
        .filter(Boolean).join(" | "),
      issue_types: [],
    };

    try {
      const res = await fetch("/api/submit-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Submission failed.");
      setSubmitState("success");
    } catch (err: unknown) {
      setSubmitState("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed inset-x-4 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {submitState === "success" ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-serif text-xl font-bold text-black mb-2">Quote Requested!</h3>
            <p className="text-caption text-gray mb-6">
              We&apos;ll be in touch shortly at <span className="font-semibold text-black">{form.email}</span>.
            </p>
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-red text-white text-caption font-bold hover:bg-red-dark transition-colors">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-black">Request a Quote</h3>
                <p className="text-caption text-gray mt-0.5">We&apos;ll log your estimate and follow up.</p>
              </div>
              <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-gray hover:text-black hover:bg-cream transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Estimate summary bar */}
            <div className="bg-cream border border-gray-border/30 rounded-xl px-4 py-3 flex items-center justify-between text-caption">
              <span className="text-gray">Estimate</span>
              <span className="font-bold text-black">{fmtTHB(result.finalQuote)} · {fmtTime(result.totalMinAll)} · {store.qty}×</span>
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              {(["first_name", "last_name"] as const).map((field, i) => (
                <div key={field}>
                  <label className="block text-micro font-semibold text-gray-muted uppercase tracking-widest mb-1">
                    {i === 0 ? "First Name" : "Last Name"} <span className="text-red">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={form[field]}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-border bg-white text-caption text-black placeholder:text-gray-muted focus:outline-none focus:ring-2 focus:ring-red/20 focus:border-red transition-colors"
                    placeholder={i === 0 ? "Somchai" : "Jaidee"}
                  />
                </div>
              ))}
            </div>

            {/* Email */}
            <div>
              <label className="block text-micro font-semibold text-gray-muted uppercase tracking-widest mb-1">
                Email <span className="text-red">*</span>
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-border bg-white text-caption text-black placeholder:text-gray-muted focus:outline-none focus:ring-2 focus:ring-red/20 focus:border-red transition-colors"
                placeholder="you@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-micro font-semibold text-gray-muted uppercase tracking-widest mb-1">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-border bg-white text-caption text-black placeholder:text-gray-muted focus:outline-none focus:ring-2 focus:ring-red/20 focus:border-red transition-colors"
                placeholder="0X-XXXX-XXXX"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-micro font-semibold text-gray-muted uppercase tracking-widest mb-1">Message</label>
              <textarea
                rows={3}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-border bg-white text-caption text-black placeholder:text-gray-muted focus:outline-none focus:ring-2 focus:ring-red/20 focus:border-red transition-colors resize-none"
                placeholder="Any additional notes or questions..."
              />
            </div>

            {/* Attach file toggle */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, will_attach_file: !f.will_attach_file }))}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 flex-shrink-0 ${
                  form.will_attach_file ? "bg-red border-red" : "border-gray-border group-hover:border-gray-muted"
                }`}
              >
                {form.will_attach_file && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span className="text-caption text-gray">I will send the STL file via email</span>
            </label>

            {submitState === "error" && (
              <div className="bg-red/5 border border-red/20 rounded-xl px-4 py-3 text-caption text-red">{errorMsg}</div>
            )}

            <button
              type="submit"
              disabled={submitState === "loading"}
              className="w-full py-3 rounded-xl text-caption font-bold bg-red text-white hover:bg-red-dark disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-200 shadow-btn"
            >
              {submitState === "loading" ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit Quote Request"
              )}
            </button>
          </form>
        )}
      </motion.div>
    </>
  );
}

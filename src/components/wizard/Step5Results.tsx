"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";
import { CostBreakdownCard } from "@/components/shared/CostBreakdownCard";
import { TimeBreakdownCard } from "@/components/shared/TimeBreakdownCard";
import { QuantityCostTable } from "@/components/shared/QuantityCostTable";
import { optimizeOrientation } from "@/lib/engine/orientation-optimizer";
import { computeOptimalBatches } from "@/lib/engine/batch-calculator";
import { FUSE1_CONFIG } from "@/lib/engine/config";
import { DEFAULT_PRINTER } from "@/config/printers";
import type { FittingPrinter } from "@/types/printer";
import type { Material } from "@/types/material";
import type { EstimatorResult } from "@/types/estimator";
import type { OptimalBatchData } from "@/lib/engine/batch-calculator";

interface Step5Props {
  x: number;
  y: number;
  z: number;
  vol: number;
  qty: number;
  printer: FittingPrinter | null;
  material: Material | null;
  purpose: string;
  color: string;
  priority: string;
  notes: string;
  onBack: () => void;
  onReset: () => void;
}

type SubmitState = "idle" | "loading" | "success" | "error";

interface ContactForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  message: string;
  will_attach_file: boolean;
}

const EMPTY_FORM: ContactForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  message: "",
  will_attach_file: false,
};

export function Step5Results({
  x, y, z, vol, qty,
  printer, material,
  purpose, color, priority, notes,
  onBack, onReset,
}: Step5Props) {
  const p = printer || DEFAULT_PRINTER;
  const density = material?.density ?? FUSE1_CONFIG.nylonDensity;

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const sinteredVolCm3 = vol > 0 ? vol / 1000 : 0;
  const sinteredKg = sinteredVolCm3 > 0 ? (sinteredVolCm3 * density) / 1000 : 0;

  const optimization = useMemo(() => {
    if (x <= 0 || y <= 0 || z <= 0) return null;
    return optimizeOrientation(x, y, z, sinteredKg, sinteredVolCm3, p, qty);
  }, [x, y, z, sinteredKg, sinteredVolCm3, p, qty]);

  const result: EstimatorResult | null = optimization?.best?.estimate ?? null;
  const orientLabel = optimization?.best?.orientation.label ?? "";

  const batchData: OptimalBatchData | null = useMemo(() => {
    if (!optimization?.best || x <= 0) return null;
    const partVolMm3 = vol > 0 ? vol : 0;
    const fit = optimization.best.fitResult;
    return computeOptimalBatches(x, y, z, p, fit, partVolMm3, density);
  }, [optimization, x, y, z, vol, p, density]);

  if (!result) {
    return (
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="text-center py-12">
        <p className="text-body text-gray-muted">
          {optimization?.allTooBig
            ? "Part does not fit in any orientation."
            : "Select a printer to see results."}
        </p>
        <button onClick={onBack} className="mt-4 text-caption text-red font-medium hover:underline">
          Go back
        </button>
      </motion.div>
    );
  }

  const fmtTime = (min: number) => {
    const h = Math.floor(min / 60);
    const m = Math.round(min % 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };
  const fmtTHB = (v: number) => `฿${v.toLocaleString()}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name || !form.last_name || !form.email) return;

    setSubmitState("loading");
    setErrorMsg("");

    if (!result) { setSubmitState("idle"); return; }

    const payload = {
      first_name:       form.first_name,
      last_name:        form.last_name,
      email:            form.email,
      phone:            form.phone,
      message:          form.message,
      will_attach_file: form.will_attach_file,
      file_name:        `${x.toFixed(0)}x${y.toFixed(0)}x${z.toFixed(0)}mm`,
      dimensions:       `${x.toFixed(1)} × ${y.toFixed(1)} × ${z.toFixed(1)} mm`,
      volume_cm3:       sinteredVolCm3.toFixed(3),
      quantity:         qty,
      printer:          p.name,
      material:         material?.name ?? "Nylon 12",
      estimated_cost:   fmtTHB(result.finalQuote),
      estimated_time:   fmtTime(result.totalMinAll),
      builds:           result.builds,
      job_notes:        [purpose, color && `Color: ${color}`, priority && `Priority: ${priority}`, notes]
                          .filter(Boolean).join(" | "),
      issue_types:      [],
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
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  function closeModal() {
    if (submitState === "loading") return;
    setShowModal(false);
    setTimeout(() => { setForm(EMPTY_FORM); setSubmitState("idle"); setErrorMsg(""); }, 300);
  }

  return (
    <>
      <motion.div
        variants={stagger(0.1, 0.1)}
        initial="initial"
        animate="animate"
        exit="exit"
        className="space-y-8"
      >
        <motion.div variants={fadeUp}>
          <h2 className="font-serif text-heading text-black mb-1">Your Estimate</h2>
          <p className="text-body text-gray">
            {qty}× part{qty > 1 ? "s" : ""} on {printer?.name ?? p.name}
            {material ? ` in ${material.name}` : ""}
          </p>
        </motion.div>

        {orientLabel && (
          <motion.div variants={fadeUp} className="flex gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-50 border border-green-200 text-micro font-semibold text-green-700">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Cost-optimal: {orientLabel}
            </span>
            {optimization && optimization.ranked.length > 1 && (
              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-cream border border-gray-border/30 text-micro text-gray">
                {optimization.ranked.length} orientations fit
              </span>
            )}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CostBreakdownCard result={result} />
          <TimeBreakdownCard result={result} />
        </div>

        {batchData && batchData.brackets.length > 1 && (
          <motion.div variants={fadeUp}>
            <QuantityCostTable data={batchData} currentQty={qty} />
          </motion.div>
        )}

        {/* Job Summary */}
        <motion.div
          variants={fadeUp}
          className="bg-cream border border-gray-border/30 rounded-2xl p-5 space-y-2"
        >
          <h3 className="text-micro uppercase tracking-widest text-gray-muted font-bold mb-3">Job Details</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-caption">
            <span className="text-gray">Dimensions</span>
            <span className="font-semibold text-black">{x.toFixed(1)} × {y.toFixed(1)} × {z.toFixed(1)} mm</span>
            {vol > 0 && (
              <>
                <span className="text-gray">Volume</span>
                <span className="font-semibold text-black">
                  {vol > 1e6 ? `${(vol / 1e6).toFixed(2)} cm³` : `${vol.toFixed(1)} mm³`}
                </span>
              </>
            )}
            <span className="text-gray">Quantity</span>
            <span className="font-semibold text-black">{qty}</span>
            <span className="text-gray">Orientation</span>
            <span className="font-semibold text-black">{orientLabel || "Default"}</span>
            <span className="text-gray">Builds needed</span>
            <span className="font-semibold text-black">{result.builds}</span>
            <span className="text-gray">Total time</span>
            <span className="font-semibold text-black">{fmtTime(result.totalMinAll)}</span>
            <span className="text-gray">Total cost</span>
            <span className="font-semibold text-black">{fmtTHB(result.finalQuote)}</span>
            <span className="text-gray">Purpose</span>
            <span className="font-semibold text-black">{purpose || "—"}</span>
            {color && (<><span className="text-gray">Color</span><span className="font-semibold text-black">{color}</span></>)}
            <span className="text-gray">Priority</span>
            <span className="font-semibold text-black">{priority || "Standard"}</span>
            {notes && (<><span className="text-gray">Notes</span><span className="font-semibold text-black">{notes}</span></>)}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div variants={fadeUp} className="flex justify-between items-center">
          <button onClick={onBack} className="px-5 py-2.5 rounded-xl text-caption font-medium text-gray hover:text-black transition-colors">
            Back
          </button>
          <div className="flex gap-3">
            <button
              onClick={onReset}
              className="px-5 py-2.5 rounded-xl text-caption font-medium border border-gray-border text-gray hover:text-black hover:border-gray-muted transition-all duration-200"
            >
              New Estimate
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2.5 rounded-xl text-caption font-bold bg-red text-white hover:bg-red-dark active:scale-[0.97] transition-all duration-300 ease-smooth shadow-btn"
            >
              Request Quote
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Submit Job Modal ── */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeModal}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed inset-x-4 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
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
                    Your job details have been saved. We&apos;ll be in touch shortly at <span className="font-semibold text-black">{form.email}</span>.
                  </p>
                  <button onClick={closeModal} className="px-6 py-2.5 rounded-xl bg-red text-white text-caption font-bold hover:bg-red-dark transition-colors">
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
                    <button type="button" onClick={closeModal} className="p-1.5 rounded-lg text-gray hover:text-black hover:bg-cream transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Estimate summary */}
                  <div className="bg-cream border border-gray-border/30 rounded-xl px-4 py-3 flex items-center justify-between text-caption">
                    <span className="text-gray">Estimate</span>
                    <span className="font-bold text-black">{fmtTHB(result.finalQuote)} · {fmtTime(result.totalMinAll)} · {qty}×</span>
                  </div>

                  {/* Name */}
                  <div className="grid grid-cols-2 gap-3">
                    {(["first_name", "last_name"] as const).map((field, i) => (
                      <div key={field}>
                        <label className="block text-micro font-semibold text-gray-muted uppercase tracking-widest mb-1">
                          {i === 0 ? "First Name" : "Last Name"} <span className="text-red">*</span>
                        </label>
                        <input
                          required type="text"
                          value={form[field]}
                          onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
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
                      required type="email" value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-border bg-white text-caption text-black placeholder:text-gray-muted focus:outline-none focus:ring-2 focus:ring-red/20 focus:border-red transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-micro font-semibold text-gray-muted uppercase tracking-widest mb-1">Phone</label>
                    <input
                      type="tel" value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-border bg-white text-caption text-black placeholder:text-gray-muted focus:outline-none focus:ring-2 focus:ring-red/20 focus:border-red transition-colors"
                      placeholder="0X-XXXX-XXXX"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-micro font-semibold text-gray-muted uppercase tracking-widest mb-1">Message</label>
                    <textarea
                      rows={3} value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-border bg-white text-caption text-black placeholder:text-gray-muted focus:outline-none focus:ring-2 focus:ring-red/20 focus:border-red transition-colors resize-none"
                      placeholder="Any additional notes or questions…"
                    />
                  </div>

                  {/* Attach file toggle */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, will_attach_file: !f.will_attach_file }))}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 flex-shrink-0 ${form.will_attach_file ? "bg-red border-red" : "border-gray-border group-hover:border-gray-muted"}`}
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
                        Submitting…
                      </span>
                    ) : "Submit Quote Request →"}
                  </button>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

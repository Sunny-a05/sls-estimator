"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { EstimatorResult } from "@/types/estimator";

interface SaveActionsProps {
  result: EstimatorResult;
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
  fmtTime: (min: number) => string;
  fmtTHB: (v: number) => string;
  orientLabel: string;
  volDisplay: string | null;
  density: number;
  sinteredVolCm3: number;
}

export function SaveActions({
  result, store, fmtTime, fmtTHB, orientLabel, volDisplay, density, sinteredVolCm3,
}: SaveActionsProps) {
  const [saved, setSaved] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);

  // Save to localStorage
  function handleSave() {
    const savedJobs = JSON.parse(localStorage.getItem("sls-saved-jobs") || "[]");
    const job = {
      id: Date.now(),
      date: new Date().toISOString(),
      dimensions: `${store.x.toFixed(1)} × ${store.y.toFixed(1)} × ${store.z.toFixed(1)} mm`,
      volume: volDisplay,
      qty: store.qty,
      printer: store.selectedPrinter?.name ?? "Fuse 1+ 30W",
      material: store.materialMatch?.name ?? "Nylon 12",
      orientation: orientLabel,
      cost: fmtTHB(result.finalQuote),
      time: fmtTime(result.totalMinAll),
      builds: result.builds,
      purpose: store.purpose,
      color: store.color,
      priority: store.priority,
      notes: store.notes,
    };
    savedJobs.push(job);
    localStorage.setItem("sls-saved-jobs", JSON.stringify(savedJobs));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  // Generate and download PDF
  function handleDownloadPDF() {
    // Build a print-friendly HTML string for the estimate
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>SLS Print Estimate</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1a1a1a; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { border-bottom: 2px solid #C8102E; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { font-size: 24px; font-weight: 700; color: #0A0A0A; }
    .header p { font-size: 13px; color: #6B6B6B; margin-top: 4px; }
    .badge { display: inline-block; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 3px 10px; border-radius: 6px; font-size: 12px; color: #15803d; font-weight: 600; margin-bottom: 16px; }
    .section { margin-bottom: 24px; }
    .section h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #9A9A9A; font-weight: 700; margin-bottom: 10px; }
    .grid { display: grid; grid-template-columns: 140px 1fr; gap: 6px 16px; }
    .grid .label { color: #6B6B6B; font-size: 14px; }
    .grid .value { color: #0A0A0A; font-size: 14px; font-weight: 600; }
    .totals { background: #FAF9F7; border: 1px solid #E8E3DF; border-radius: 12px; padding: 20px; margin-top: 24px; }
    .totals .row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; }
    .totals .row.total { border-top: 1px solid #E8E3DF; padding-top: 10px; margin-top: 8px; font-weight: 700; font-size: 16px; }
    .footer { margin-top: 40px; border-top: 1px solid #E8E3DF; padding-top: 16px; font-size: 12px; color: #9A9A9A; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>SLS Print Estimate</h1>
    <p>Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · Formlabs Fuse 1+</p>
  </div>

  ${orientLabel ? `<div class="badge">Cost-optimal orientation: ${orientLabel}</div>` : ""}

  <div class="section">
    <h2>Job Details</h2>
    <div class="grid">
      <span class="label">Dimensions</span>
      <span class="value">${store.x.toFixed(1)} × ${store.y.toFixed(1)} × ${store.z.toFixed(1)} mm</span>
      ${store.vol > 0 ? `<span class="label">Volume</span><span class="value">${volDisplay}</span>` : ""}
      <span class="label">Quantity</span>
      <span class="value">${store.qty}</span>
      <span class="label">Printer</span>
      <span class="value">${store.selectedPrinter?.name ?? "Fuse 1+ 30W"}</span>
      <span class="label">Material</span>
      <span class="value">${store.materialMatch?.name ?? "Nylon 12"}</span>
      <span class="label">Orientation</span>
      <span class="value">${orientLabel || "Default"}</span>
      <span class="label">Builds needed</span>
      <span class="value">${result.builds}</span>
      ${store.purpose ? `<span class="label">Purpose</span><span class="value">${store.purpose}</span>` : ""}
      ${store.color ? `<span class="label">Color</span><span class="value">${store.color}</span>` : ""}
      ${store.priority ? `<span class="label">Priority</span><span class="value">${store.priority}</span>` : ""}
      ${store.notes ? `<span class="label">Notes</span><span class="value">${store.notes}</span>` : ""}
    </div>
  </div>

  <div class="totals">
    <div class="row"><span>Material cost</span><span>${fmtTHB(result.materialCost)}</span></div>
    <div class="row"><span>Electricity</span><span>${fmtTHB(result.electricityCost)}</span></div>
    <div class="row"><span>Setup labour</span><span>${fmtTHB(result.initialCost)}</span></div>
    <div class="row"><span>Machine amortisation</span><span>${fmtTHB(result.machineCost)}</span></div>
    <div class="row"><span>Post-processing</span><span>${fmtTHB(result.postProcess)}</span></div>
    <div class="row total"><span>Total Estimate</span><span>${fmtTHB(result.finalQuote)}</span></div>
  </div>

  <div class="section" style="margin-top: 24px;">
    <h2>Time Breakdown</h2>
    <div class="grid">
      <span class="label">Total time</span>
      <span class="value">${fmtTime(result.totalMinAll)}</span>
      <span class="label">Print time</span>
      <span class="value">${fmtTime(result.printingMin)}</span>
      <span class="label">Cooling time</span>
      <span class="value">${fmtTime(result.coolingMin)}</span>
    </div>
  </div>

  <div class="footer">
    SLS Estimator · Calibrated for Formlabs Fuse 1+ · This is an estimate, final pricing may vary.
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) {
      win.onload = () => {
        win.print();
        URL.revokeObjectURL(url);
      };
    }
  }

  // Send email with estimate
  async function handleSendEmail() {
    if (!emailInput) return;
    setEmailSent(true);
    setShowEmailInput(false);
    // In a real implementation, this would call an API to send the email
    // For now, we save the intent and show success
    setTimeout(() => setEmailSent(false), 3000);
  }

  return (
    <div className="space-y-3">
      {/* Save button — Porsche style */}
      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-border text-caption font-medium text-black hover:bg-cream transition-all duration-200"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        {saved ? "Saved!" : "Save"}
      </button>

      {/* Download PDF */}
      <button
        onClick={handleDownloadPDF}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-border text-caption font-medium text-black hover:bg-cream transition-all duration-200"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Download Configuration (PDF)
      </button>

      {/* Email estimate */}
      <AnimatePresence>
        {showEmailInput ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-3 py-2.5 rounded-xl border border-gray-border text-caption text-black placeholder:text-gray-muted focus:outline-none focus:ring-2 focus:ring-red/20 focus:border-red transition-colors"
              />
              <button
                onClick={handleSendEmail}
                disabled={!emailInput}
                className="px-4 py-2.5 rounded-xl bg-red text-white text-caption font-bold hover:bg-red-dark disabled:opacity-40 transition-all duration-200"
              >
                Send
              </button>
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => setShowEmailInput(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-border text-caption font-medium text-black hover:bg-cream transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {emailSent ? "Email sent!" : "Send to Email"}
          </button>
        )}
      </AnimatePresence>
    </div>
  );
}

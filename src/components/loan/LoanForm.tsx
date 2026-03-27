"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

type SubmitState = "idle" | "loading" | "success" | "error";

interface LoanFormData {
  modelName: string;
  name: string;
  dept: string;
  email: string;
  amount: string;
  startDate: string;
  returnDate: string;
  purpose: string;
}

const EMPTY: LoanFormData = {
  modelName: "",
  name: "",
  dept: "",
  email: "",
  amount: "1",
  startDate: "",
  returnDate: "",
  purpose: "",
};

const INPUT_CLASS =
  "w-full px-3 py-2.5 rounded-xl border border-gray-border bg-white text-caption text-black placeholder:text-gray-muted focus:outline-none focus:ring-2 focus:ring-red/20 focus:border-red transition-colors";

const LABEL_CLASS =
  "block text-micro font-semibold text-gray-muted uppercase tracking-widest mb-1.5";

export function LoanForm() {
  const [form, setForm] = useState<LoanFormData>(EMPTY);
  const [state, setState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function set(field: keyof LoanFormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/loan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Submission failed.");
      setState("success");
    } catch (err: unknown) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  function handleReset() {
    setForm(EMPTY);
    setState("idle");
    setErrorMsg("");
  }

  if (state === "success") {
    return (
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-serif text-2xl font-bold text-black mb-2">Request Submitted!</h3>
        <p className="text-body text-gray mb-2">
          Your loan request for <span className="font-semibold text-black">{form.modelName}</span> is pending admin approval.
        </p>
        <p className="text-caption text-gray-muted mb-8">
          You&apos;ll receive an email at <span className="font-semibold text-black">{form.email}</span> when it&apos;s reviewed.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleReset}
            className="px-6 py-2.5 rounded-xl border border-gray-border text-caption font-medium text-gray hover:text-black hover:border-gray-muted transition-all duration-200"
          >
            New Request
          </button>
          <a
            href={`/loan/status?email=${encodeURIComponent(form.email)}`}
            className="px-6 py-2.5 rounded-xl bg-red text-white text-caption font-bold hover:bg-red-dark transition-colors shadow-btn"
          >
            Check Status →
          </a>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.form
      variants={fadeUp}
      initial="initial"
      animate="animate"
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Model name */}
      <div>
        <label className={LABEL_CLASS}>
          Model / Part Name <span className="text-red normal-case tracking-normal font-normal">*</span>
        </label>
        <input
          required type="text" value={form.modelName} onChange={set("modelName")}
          className={INPUT_CLASS}
          placeholder="e.g. Fuse 1 Piston Assembly"
        />
      </div>

      {/* Name + Department */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>
            Your Name <span className="text-red normal-case tracking-normal font-normal">*</span>
          </label>
          <input
            required type="text" value={form.name} onChange={set("name")}
            className={INPUT_CLASS}
            placeholder="Full name"
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>Department</label>
          <input
            type="text" value={form.dept} onChange={set("dept")}
            className={INPUT_CLASS}
            placeholder="e.g. Engineering, Sales"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className={LABEL_CLASS}>
          Email <span className="text-red normal-case tracking-normal font-normal">*</span>
        </label>
        <input
          required type="email" value={form.email} onChange={set("email")}
          className={INPUT_CLASS}
          placeholder="you@applicad.co.th"
        />
      </div>

      {/* Amount + Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={LABEL_CLASS}>
            Pieces <span className="text-red normal-case tracking-normal font-normal">*</span>
          </label>
          <input
            required type="number" min="1" value={form.amount} onChange={set("amount")}
            className={INPUT_CLASS}
            placeholder="1"
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>
            Loan Start <span className="text-red normal-case tracking-normal font-normal">*</span>
          </label>
          <input
            required type="date" value={form.startDate} onChange={set("startDate")}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>
            Return By <span className="text-red normal-case tracking-normal font-normal">*</span>
          </label>
          <input
            required type="date" value={form.returnDate} onChange={set("returnDate")}
            min={form.startDate || undefined}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      {/* Purpose */}
      <div>
        <label className={LABEL_CLASS}>Purpose / Notes</label>
        <textarea
          rows={3} value={form.purpose} onChange={set("purpose")}
          className={`${INPUT_CLASS} resize-none`}
          placeholder="What will you use the model for? Any special requirements?"
        />
      </div>

      {state === "error" && (
        <div className="bg-red/5 border border-red/20 rounded-xl px-4 py-3 text-caption text-red">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full py-3 rounded-xl text-caption font-bold bg-red text-white hover:bg-red-dark disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-200 shadow-btn"
      >
        {state === "loading" ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Submitting…
          </span>
        ) : "Submit Loan Request →"}
      </button>
    </motion.form>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "@/lib/motion";

interface LoanRecord {
  modelName: string;
  name: string;
  dept: string;
  amount: string;
  startDate: string;
  returnDate: string;
  status: "Active" | "Pending" | "Returned" | "Rejected" | string;
  purpose: string;
  timestamp: string;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  Active:   { label: "Active",   bg: "bg-green-50",  text: "text-green-700", dot: "bg-green-500" },
  Pending:  { label: "Pending",  bg: "bg-amber-50",  text: "text-amber-700", dot: "bg-amber-400" },
  Returned: { label: "Returned", bg: "bg-gray-100",  text: "text-gray-600",  dot: "bg-gray-400"  },
  Rejected: { label: "Rejected", bg: "bg-red/5",     text: "text-red",       dot: "bg-red"       },
};

function getStatus(s: string) {
  return STATUS_CONFIG[s] ?? { label: s, bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
}

function fmt(d: string) {
  if (!d) return "—";
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

export function LoanStatus({ initialEmail = "" }: { initialEmail?: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [input, setInput] = useState(initialEmail);
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!initialEmail);
  const [error, setError] = useState("");

  async function fetchStatus(e?: React.FormEvent) {
    e?.preventDefault();
    const q = input.trim();
    if (!q) return;

    setLoading(true);
    setError("");
    setEmail(q);

    try {
      const res = await fetch(`/api/loan?email=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed to fetch status.");
      setLoans(data.loans ?? []);
      setSearched(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoans([]);
    } finally {
      setLoading(false);
    }
  }

  // Auto-fetch on mount if initialEmail provided
  useState(() => {
    if (initialEmail) fetchStatus();
  });

  return (
    <div className="space-y-6">
      {/* Search form */}
      <form onSubmit={fetchStatus} className="flex gap-3">
        <input
          type="email"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter your email address"
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-border bg-white text-caption text-black placeholder:text-gray-muted focus:outline-none focus:ring-2 focus:ring-red/20 focus:border-red transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-2.5 rounded-xl bg-red text-white text-caption font-bold hover:bg-red-dark disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {loading ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : "Check Status"}
        </button>
      </form>

      {error && (
        <div className="bg-red/5 border border-red/20 rounded-xl px-4 py-3 text-caption text-red">{error}</div>
      )}

      <AnimatePresence mode="wait">
        {searched && !loading && (
          <motion.div
            key={email}
            variants={fadeUp}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0, y: -10 }}
          >
            {loans.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-full bg-cream border border-gray-border/30 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-5 h-5 text-gray-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
                  </svg>
                </div>
                <p className="text-caption text-gray">No loan records found for <span className="font-semibold text-black">{email}</span></p>
                <p className="text-micro text-gray-muted mt-1">Double-check your email or submit a new request.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-caption text-gray">
                  Found <span className="font-semibold text-black">{loans.length}</span> loan{loans.length > 1 ? "s" : ""} for {email}
                </p>
                {loans.map((loan, i) => {
                  const s = getStatus(loan.status);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="bg-white border border-gray-border/50 rounded-2xl p-5 space-y-4"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-serif text-base font-bold text-black leading-tight">{loan.modelName || "—"}</h4>
                          <p className="text-micro text-gray-muted mt-0.5">{loan.name}{loan.dept ? ` · ${loan.dept}` : ""}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-micro font-semibold whitespace-nowrap ${s.bg} ${s.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          {s.label}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-caption">
                        <div>
                          <span className="block text-micro text-gray-muted uppercase tracking-widest font-semibold mb-0.5">Pieces</span>
                          <span className="font-semibold text-black">{loan.amount || "—"}</span>
                        </div>
                        <div>
                          <span className="block text-micro text-gray-muted uppercase tracking-widest font-semibold mb-0.5">Start</span>
                          <span className="font-semibold text-black">{fmt(loan.startDate)}</span>
                        </div>
                        <div>
                          <span className="block text-micro text-gray-muted uppercase tracking-widest font-semibold mb-0.5">Return By</span>
                          <span className="font-semibold text-black">{fmt(loan.returnDate)}</span>
                        </div>
                      </div>

                      {loan.purpose && (
                        <p className="text-caption text-gray border-t border-gray-border/30 pt-3">
                          <span className="font-semibold text-black">Purpose: </span>{loan.purpose}
                        </p>
                      )}

                      {loan.status === "Pending" && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-caption text-amber-700">
                          ⏳ Awaiting admin approval — you&apos;ll receive an email once reviewed.
                        </div>
                      )}
                      {loan.status === "Rejected" && (
                        <div className="bg-red/5 border border-red/20 rounded-xl px-4 py-2.5 text-caption text-red">
                          This request was not approved. Contact <a href="mailto:supparerk.po@gmail.com" className="underline font-semibold">the admin</a> for details.
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

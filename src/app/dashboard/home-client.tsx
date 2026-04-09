"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import type { Business, Transaction } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";

function formatCurrency(amount: number, currency: string) {
  return `${currency} ${Number(amount).toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "short",
  });
}

type UserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
} | null;

export default function HomeClient({
  user,
  profile,
  businesses,
  transactions,
}: {
  user: User;
  profile: UserProfile;
  businesses: Business[];
  transactions: Transaction[];
}) {
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(businesses[0] ?? null);
  const [showNewBusiness, setShowNewBusiness] = useState(false);
  const [newBusinessName, setNewBusinessName] = useState("");
  const [newBusinessCurrency, setNewBusinessCurrency] = useState("CHF");
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const bizTransactions = useMemo(() => {
    if (!activeBusiness) return transactions;
    return transactions.filter((t) => t.business_id === activeBusiness.id);
  }, [transactions, activeBusiness]);

  const summary = useMemo(() => {
    const income = bizTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = bizTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0);
    return { income, expense, balance: income - expense };
  }, [bizTransactions]);

  const currency = activeBusiness?.currency ?? "CHF";
  const greeting = profile?.full_name ? profile.full_name.split(" ")[0] : "there";

  async function handleCreateBusiness() {
    if (!newBusinessName.trim()) return;
    setCreating(true);
    const supabase = createClient();
    await (supabase.from("businesses") as any).insert({
      name: newBusinessName.trim(),
      currency: newBusinessCurrency,
      user_id: user.id,
    });
    setNewBusinessName("");
    setNewBusinessCurrency("CHF");
    setShowNewBusiness(false);
    setCreating(false);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Hi {greeting} 👋</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Here&apos;s your overview</p>
      </div>

      {/* Business selector */}
      {businesses.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {businesses.map((b) => (
            <button
              key={b.id}
              onClick={() => setActiveBusiness(b)}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                activeBusiness?.id === b.id
                  ? "bg-brand text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              {b.name}
            </button>
          ))}
          <button
            onClick={() => setShowNewBusiness(true)}
            className="rounded-full px-3 py-1 text-sm bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
          >
            +
          </button>
        </div>
      )}

      {businesses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center">
          <div className="text-4xl mb-3">🏢</div>
          <p className="text-sm text-zinc-500 mb-4">Create your first business to get started</p>
          <button
            onClick={() => setShowNewBusiness(true)}
            className="rounded-xl bg-brand px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-hover"
          >
            + New Business
          </button>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-xs text-zinc-500">Income</p>
              <p className="text-lg font-semibold text-green-600 mt-1">
                {formatCurrency(summary.income, currency)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-xs text-zinc-500">Expenses</p>
              <p className="text-lg font-semibold text-red-600 mt-1">
                {formatCurrency(summary.expense, currency)}
              </p>
            </div>
          </div>

          {/* Quick scan CTA */}
          <Link
            href="/dashboard/scan"
            className="flex items-center justify-center gap-2 w-full rounded-2xl bg-brand py-4 text-base font-medium text-white hover:bg-brand-hover transition-colors shadow-sm active:scale-[0.98]"
          >
            📸 Scan bill
          </Link>

          {/* Recent transactions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-zinc-900">Recent</h2>
              {bizTransactions.length > 0 && (
                <Link href="/dashboard/transactions" className="text-sm text-brand hover:text-brand-hover">
                  See all →
                </Link>
              )}
            </div>

            {bizTransactions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center">
                <p className="text-sm text-zinc-400">No transactions yet. Scan your first bill!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {bizTransactions.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{t.counterparty ?? "Unknown"}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{formatDate(t.document_date)}</p>
                    </div>
                    <p
                      className={`text-sm font-semibold ml-3 shrink-0 ${
                        t.type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {t.type === "income" ? "+" : "−"}
                      {formatCurrency(Number(t.amount), t.currency)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* New Business Modal */}
      {showNewBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-5">
            <div>
              <h2 className="text-lg font-bold text-zinc-900">New business</h2>
              <p className="text-sm text-zinc-500 mt-1">Add your side-hustle or freelance gig</p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="biz-name" className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Business name
                </label>
                <input
                  id="biz-name"
                  type="text"
                  autoFocus
                  placeholder="e.g. My Freelance Gig"
                  value={newBusinessName}
                  onChange={(e) => setNewBusinessName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateBusiness()}
                  className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div>
                <label htmlFor="biz-currency" className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Currency
                </label>
                <select
                  id="biz-currency"
                  value={newBusinessCurrency}
                  onChange={(e) => setNewBusinessCurrency(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  <option value="CHF">CHF — Swiss Franc</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="GBP">GBP — British Pound</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => {
                  setShowNewBusiness(false);
                  setNewBusinessName("");
                  setNewBusinessCurrency("CHF");
                }}
                className="flex-1 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBusiness}
                disabled={!newBusinessName.trim() || creating}
                className="flex-1 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { Business, Transaction } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";
import ScanModal from "@/components/scan-modal";

type FilterType = "all" | "income" | "expense";
type FilterStatus = "all" | "pending" | "paid" | "unpaid";

function formatCurrency(amount: number, currency: string) {
  return `${currency} ${Number(amount).toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DashboardClient({
  user,
  businesses,
  transactions,
}: {
  user: User;
  businesses: Business[];
  transactions: Transaction[];
}) {
  const [showScan, setShowScan] = useState(false);
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(
    businesses[0] ?? null
  );
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Filter transactions
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (activeBusiness && t.business_id !== activeBusiness.id) return false;
      if (filterType !== "all" && t.type !== filterType) return false;
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      if (dateFrom && t.document_date && t.document_date < dateFrom) return false;
      if (dateTo && t.document_date && t.document_date > dateTo) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          t.counterparty?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.document_ref?.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [transactions, activeBusiness, filterType, filterStatus, dateFrom, dateTo, searchQuery]);

  // Summary calculations
  const summary = useMemo(() => {
    const income = filtered
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = filtered
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return { income, expense, balance: income - expense, count: filtered.length };
  }, [filtered]);

  const currency = activeBusiness?.currency ?? "CHF";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handleCreateBusiness() {
    const name = prompt("Business name:");
    if (!name) return;
    const supabase = createClient();
    await (supabase.from("businesses") as any).insert({ name, user_id: user.id });
    router.refresh();
  }

  function handleExportCSV() {
    const headers = ["Date", "Type", "Document", "Status", "Counterparty", "Description", "Amount", "Currency", "Payment", "Ref"];
    const rows = filtered.map((t) => [
      t.document_date ?? "",
      t.type,
      t.document_type,
      t.status,
      t.counterparty ?? "",
      t.description ?? "",
      Number(t.amount).toFixed(2),
      t.currency,
      t.payment_method ?? "",
      t.document_ref ?? "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `byebills-${activeBusiness?.name ?? "all"}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function clearFilters() {
    setFilterType("all");
    setFilterStatus("all");
    setDateFrom("");
    setDateTo("");
    setSearchQuery("");
  }

  const hasFilters = filterType !== "all" || filterStatus !== "all" || dateFrom || dateTo || searchQuery;

  return (
    <main className="mx-auto max-w-2xl px-3 sm:px-4 py-4 space-y-4 sm:space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-brand">ByeBills</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          Sign out
        </button>
      </div>

      {/* Business selector */}
      {businesses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center">
          <p className="text-sm text-gray-500 mb-3">
            Create your first business to get started
          </p>
          <button
            onClick={handleCreateBusiness}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
          >
            + New Business
          </button>
        </div>
      ) : (
        <>
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
              onClick={handleCreateBusiness}
              className="rounded-full px-3 py-1 text-sm bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
            >
              +
            </button>
          </div>

          {/* Scan button */}
          <button
            onClick={() => setShowScan(true)}
            className="w-full rounded-xl bg-brand py-3.5 text-sm font-medium text-white hover:bg-brand-hover transition-colors shadow-sm"
          >
            📸 Scan Invoice / Upload Bill
          </button>

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-3 sm:p-4">
              <p className="text-xs text-gray-500 mb-1">Income</p>
              <p className="text-base sm:text-lg font-semibold text-green-600">
                {formatCurrency(summary.income, currency)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-3 sm:p-4">
              <p className="text-xs text-gray-500 mb-1">Expenses</p>
              <p className="text-base sm:text-lg font-semibold text-red-600">
                {formatCurrency(summary.expense, currency)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-3 sm:p-4">
              <p className="text-xs text-gray-500 mb-1">Balance</p>
              <p className={`text-base sm:text-lg font-semibold ${summary.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(summary.balance, currency)}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                <option value="all">All types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                <option value="all">All statuses</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="pending">Pending</option>
              </select>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                placeholder="From"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                placeholder="To"
              />
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="rounded-lg px-2 py-1.5 text-sm text-zinc-500 hover:text-zinc-900"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Transaction list header */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500">
              {summary.count} transaction{summary.count !== 1 ? "s" : ""}
            </h2>
            {filtered.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="text-sm text-brand hover:text-brand-hover font-medium"
              >
                Export CSV
              </button>
            )}
          </div>

          {/* Transaction list */}
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center">
                <p className="text-sm text-gray-400">
                  {transactions.length === 0
                    ? "No transactions yet. Scan your first invoice!"
                    : "No transactions match your filters."}
                </p>
              </div>
            ) : (
              filtered.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 hover:border-zinc-300 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {t.counterparty ?? "Unknown"}
                      </p>
                      <span
                        className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          t.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : t.status === "unpaid"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {formatDate(t.document_date)}
                      {t.description ? ` · ${t.description}` : ""}
                      {t.payment_method ? ` · ${t.payment_method}` : ""}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-semibold ml-4 shrink-0 ${
                      t.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {t.type === "income" ? "+" : "−"}
                    {formatCurrency(Number(t.amount), t.currency)}
                  </p>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Scan modal */}
      {showScan && activeBusiness && (
        <ScanModal
          businessId={activeBusiness.id}
          onClose={() => {
            setShowScan(false);
            router.refresh();
          }}
        />
      )}
    </main>
  );
}

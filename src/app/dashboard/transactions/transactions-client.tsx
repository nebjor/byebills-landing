"use client";

import { useState, useMemo } from "react";
import type { Business, Transaction } from "@/lib/database.types";

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

export default function TransactionsClient({
  businesses,
  transactions,
}: {
  businesses: Business[];
  transactions: Transaction[];
}) {
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(businesses[0] ?? null);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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

  const summary = useMemo(() => {
    const income = filtered.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = filtered.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0);
    return { income, expense, balance: income - expense, count: filtered.length };
  }, [filtered]);

  const currency = activeBusiness?.currency ?? "CHF";

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
    <div className="space-y-4">
      {/* Business selector */}
      {businesses.length > 1 && (
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
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-3">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Income</p>
          <p className="text-sm font-semibold text-green-600 mt-0.5">{formatCurrency(summary.income, currency)}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-3">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Expenses</p>
          <p className="text-sm font-semibold text-red-600 mt-0.5">{formatCurrency(summary.expense, currency)}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-3">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Balance</p>
          <p className={`text-sm font-semibold mt-0.5 ${summary.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(summary.balance, currency)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
        />
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
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          {hasFilters && (
            <button onClick={clearFilters} className="rounded-lg px-2 py-1.5 text-sm text-zinc-500 hover:text-zinc-900">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Header with count + export */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-500">
          {summary.count} transaction{summary.count !== 1 ? "s" : ""}
        </h2>
        {filtered.length > 0 && (
          <button onClick={handleExportCSV} className="text-sm text-brand hover:text-brand-hover font-medium">
            Export CSV
          </button>
        )}
      </div>

      {/* Transaction list */}
      <div className="space-y-2 pb-4">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center">
            <p className="text-sm text-zinc-400">
              {transactions.length === 0
                ? "No transactions yet. Scan your first invoice!"
                : "No transactions match your filters."}
            </p>
          </div>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3.5 hover:border-zinc-300 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{t.counterparty ?? "Unknown"}</p>
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
                <p className="text-xs text-zinc-500 mt-0.5 truncate">
                  {formatDate(t.document_date)}
                  {t.description ? ` · ${t.description}` : ""}
                </p>
              </div>
              <p
                className={`text-sm font-semibold ml-4 shrink-0 ${
                  t.type === "income" ? "text-green-600" : "text-red-600"
                }`}
              >
                {t.type === "income" ? "+" : "−"}
                {formatCurrency(Number(t.amount), t.currency)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

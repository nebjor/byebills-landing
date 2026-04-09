"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { Business, Transaction } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";
import ScanModal from "@/components/scan-modal";

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
  const router = useRouter();

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

  return (
    <main className="mx-auto max-w-lg p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">ByeBills</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          Sign out
        </button>
      </div>

      {/* Business selector */}
      {businesses.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <p className="text-sm text-gray-500 mb-3">
            Create your first business to get started
          </p>
          <button
            onClick={handleCreateBusiness}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
          >
            + New Business
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            {businesses.map((b) => (
              <button
                key={b.id}
                onClick={() => setActiveBusiness(b)}
                className={`rounded-full px-3 py-1 text-sm ${
                  activeBusiness?.id === b.id
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-700"
                }`}
              >
                {b.name}
              </button>
            ))}
            <button
              onClick={handleCreateBusiness}
              className="rounded-full px-3 py-1 text-sm bg-zinc-100 text-zinc-500"
            >
              +
            </button>
          </div>

          {/* Scan button */}
          <button
            onClick={() => setShowScan(true)}
            className="w-full rounded-lg bg-zinc-900 py-3 text-sm font-medium text-white hover:bg-zinc-800"
          >
            📸 Scan Invoice / Upload Bill
          </button>

          {/* Transaction list */}
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-gray-500">
              Recent Transactions
            </h2>
            {transactions.length === 0 ? (
              <p className="text-sm text-gray-400">
                No transactions yet. Scan your first invoice!
              </p>
            ) : (
              transactions
                .filter(
                  (t) =>
                    !activeBusiness || t.business_id === activeBusiness.id
                )
                .map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {t.counterparty ?? "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t.document_date} · {t.document_type} · {t.status}
                      </p>
                    </div>
                    <p
                      className={`text-sm font-medium ${
                        t.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {t.currency} {Number(t.amount).toFixed(2)}
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { Business } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";

export default function ProjectsClient({
  user,
  businesses,
}: {
  user: User;
  businesses: Business[];
}) {
  const [showNewBusiness, setShowNewBusiness] = useState(false);
  const [newBusinessName, setNewBusinessName] = useState("");
  const [newBusinessCurrency, setNewBusinessCurrency] = useState("CHF");
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Business | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const active = businesses.filter((b) => !b.archived);
  const archived = businesses.filter((b) => b.archived);

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

  async function handleArchiveBusiness(biz: Business) {
    const supabase = createClient();
    await (supabase.from("businesses") as any)
      .update({ archived: !biz.archived })
      .eq("id", biz.id);
    router.refresh();
  }

  async function handleDeleteBusiness() {
    if (!confirmDelete) return;
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("transactions").delete().eq("business_id", confirmDelete.id);
    await supabase.from("businesses").delete().eq("id", confirmDelete.id);
    setConfirmDelete(null);
    setDeleting(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-900">Projects</h1>
        <button
          onClick={() => setShowNewBusiness(true)}
          className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
        >
          + New
        </button>
      </div>

      {/* Active businesses */}
      {active.length === 0 && archived.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center">
          <div className="text-4xl mb-3">🏢</div>
          <p className="text-sm text-zinc-500 mb-4">
            No projects yet. Create your first business to start scanning bills.
          </p>
          <button
            onClick={() => setShowNewBusiness(true)}
            className="rounded-xl bg-brand px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-hover"
          >
            + New Business
          </button>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="space-y-2">
              {active.map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl border border-zinc-200 bg-white p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{b.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {b.currency} · Created{" "}
                      {new Date(b.created_at).toLocaleDateString("de-CH")}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleArchiveBusiness(b)}
                      className="rounded-lg px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-100"
                      title="Archive"
                    >
                      Archive
                    </button>
                    <button
                      onClick={() => setConfirmDelete(b)}
                      className="rounded-lg px-3 py-1.5 text-xs text-red-500 hover:bg-red-50"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Archived businesses */}
          {archived.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Archived
              </h2>
              <div className="space-y-2">
                {archived.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm text-zinc-400">{b.name}</p>
                      <p className="text-xs text-zinc-300 mt-0.5">{b.currency}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleArchiveBusiness(b)}
                        className="rounded-lg px-3 py-1.5 text-xs text-brand hover:bg-brand/5"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => setConfirmDelete(b)}
                        className="rounded-lg px-3 py-1.5 text-xs text-red-400 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* New Business Modal */}
      {showNewBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-5">
            <div>
              <h2 className="text-lg font-bold text-zinc-900">New business</h2>
              <p className="text-sm text-zinc-500 mt-1">
                Add your side-hustle or freelance gig
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="proj-name"
                  className="block text-sm font-medium text-zinc-700 mb-1.5"
                >
                  Business name
                </label>
                <input
                  id="proj-name"
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
                <label
                  htmlFor="proj-currency"
                  className="block text-sm font-medium text-zinc-700 mb-1.5"
                >
                  Currency
                </label>
                <select
                  id="proj-currency"
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

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div>
              <h2 className="text-lg font-bold text-zinc-900">
                Delete &quot;{confirmDelete.name}&quot;?
              </h2>
              <p className="text-sm text-zinc-500 mt-2">
                This will permanently delete the business and all its transactions.
                This action cannot be undone.
              </p>
              <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3">
                <p className="text-sm text-amber-800">
                  💡 <strong>Tip:</strong> You can also{" "}
                  <button
                    onClick={() => {
                      handleArchiveBusiness(confirmDelete);
                      setConfirmDelete(null);
                    }}
                    className="underline font-medium hover:text-amber-900"
                  >
                    archive this business
                  </button>{" "}
                  instead — it will be hidden but you can restore it later.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBusiness}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

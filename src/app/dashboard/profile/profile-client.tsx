"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { Business } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";

type UserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
} | null;

export default function ProfileClient({
  user,
  profile,
  businesses,
}: {
  user: User;
  profile: UserProfile;
  businesses: Business[];
}) {
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    await (supabase.from("users") as any).update({ full_name: fullName }).eq("id", user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  async function handleCreateBusiness() {
    const name = prompt("Business name:");
    if (!name) return;
    const supabase = createClient();
    await (supabase.from("businesses") as any).insert({ name, user_id: user.id });
    router.refresh();
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* User info */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider">Account</h2>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-4">
          <div>
            <label className="text-xs text-zinc-500">Email</label>
            <p className="text-sm text-zinc-900 mt-0.5">{user.email}</p>
          </div>

          <div>
            <label className="text-xs text-zinc-500 block mb-1">Full Name</label>
            <div className="flex gap-2">
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
              >
                {saving ? "..." : saved ? "✓" : "Save"}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-500">Member since</label>
            <p className="text-sm text-zinc-900 mt-0.5">
              {new Date(profile?.created_at ?? user.created_at).toLocaleDateString("de-CH", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </section>

      {/* Businesses */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider">Businesses</h2>
          <button
            onClick={handleCreateBusiness}
            className="text-sm text-brand hover:text-brand-hover font-medium"
          >
            + Add
          </button>
        </div>

        {businesses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center">
            <p className="text-sm text-zinc-400">No businesses yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {businesses.map((b) => (
              <div
                key={b.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900">{b.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{b.currency}</p>
                </div>
                <span className="text-xs text-zinc-400">
                  {new Date(b.created_at).toLocaleDateString("de-CH")}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sign out */}
      <button
        onClick={handleLogout}
        className="w-full rounded-xl border border-red-200 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}

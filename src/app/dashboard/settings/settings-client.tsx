"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type UserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
} | null;

export default function SettingsClient({
  user,
  profile,
}: {
  user: User;
  profile: UserProfile;
}) {
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currency, setCurrency] = useState("CHF");
  const [notifications, setNotifications] = useState(true);
  const router = useRouter();

  async function handleSaveProfile() {
    setSaving(true);
    const supabase = createClient();
    await (supabase.from("users") as any).update({ full_name: fullName }).eq("id", user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
      {/* Account / Profile */}
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
                onClick={handleSaveProfile}
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

      {/* General */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider">General</h2>

        <div className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-zinc-900">Default Currency</p>
              <p className="text-xs text-zinc-500 mt-0.5">Used for new businesses</p>
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              <option value="CHF">CHF</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-zinc-900">Notifications</p>
              <p className="text-xs text-zinc-500 mt-0.5">Due date reminders</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
                notifications ? "bg-brand" : "bg-zinc-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform mt-0.5 ${
                  notifications ? "translate-x-5.5 ml-0.5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Data */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider">Data</h2>

        <div className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-zinc-900">Export All Data</p>
              <p className="text-xs text-zinc-500 mt-0.5">Download all transactions as CSV</p>
            </div>
            <button className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
              Export
            </button>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider">About</h2>

        <div className="rounded-xl border border-zinc-200 bg-white divide-y divide-zinc-100">
          <div className="flex items-center justify-between p-4">
            <p className="text-sm text-zinc-900">Version</p>
            <p className="text-sm text-zinc-500">0.1.0</p>
          </div>
          <div className="flex items-center justify-between p-4">
            <p className="text-sm text-zinc-900">Support</p>
            <a href="mailto:info@byebills.app" className="text-sm text-brand hover:text-brand-hover">
              info@byebills.app
            </a>
          </div>
        </div>
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

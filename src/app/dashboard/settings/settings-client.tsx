"use client";

import { useState } from "react";

export default function SettingsClient() {
  const [currency, setCurrency] = useState("CHF");
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="space-y-6">
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
            <a href="mailto:hey@byebills.app" className="text-sm text-brand hover:text-brand-hover">
              hey@byebills.app
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

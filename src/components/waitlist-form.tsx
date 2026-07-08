"use client";

import { useState } from "react";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMsg("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMsg(data.error ?? "Something went wrong.");
        return;
      }
      setStatus("done");
    } catch {
      setStatus("error");
      setMsg("Network error — try again.");
    }
  };

  if (status === "done") {
    return (
      <div
        className="rounded-2xl border px-5 py-4 text-[16px] font-bold"
        style={{ backgroundColor: "#E9F9F0", borderColor: "#BEEBD3", color: "#0F5132" }}
      >
        🎉 You&apos;re on the list! Keep an eye on your inbox.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2.5 sm:flex-row">
      <div className="flex flex-1 flex-col gap-2.5 sm:flex-row">
        <input
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-full border-[1.5px] bg-white px-5 py-3.5 text-[16px] outline-none focus:border-[color:var(--color-brand)]"
          style={{ borderColor: "#EFE6D2" }}
        />
        <input
          type="text"
          placeholder="First name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-full border-[1.5px] bg-white px-5 py-3.5 text-[16px] outline-none focus:border-[color:var(--color-brand)] sm:w-40"
          style={{ borderColor: "#EFE6D2" }}
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="whitespace-nowrap rounded-full bg-brand px-7 py-3.5 text-[16px] font-bold text-white shadow-md transition hover:brightness-105 disabled:opacity-60"
      >
        {status === "loading" ? "Joining…" : "Get early access"}
      </button>
      {status === "error" ? (
        <p className="text-[13px] font-semibold text-[#E5484D] sm:absolute sm:mt-14">{msg}</p>
      ) : null}
    </form>
  );
}

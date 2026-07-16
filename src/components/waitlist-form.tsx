"use client";

import { useEffect, useState } from "react";
import posthog from "posthog-js";

const FREE_SPOTS = 12; // first 12 signups get byeBills forever free

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);

  // Live count from the Supabase waitlist table.
  useEffect(() => {
    fetch("/api/waitlist/count")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.count === "number") setSpotsLeft(Math.max(0, FREE_SPOTS - d.count));
      })
      .catch(() => {});
  }, []);

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
      setSpotsLeft((s) => (s === null ? s : Math.max(0, s - 1)));
      posthog.capture("waitlist_joined", { has_name: name.trim().length > 0 });
    } catch {
      setStatus("error");
      setMsg("Network error — try again.");
    }
  };

  const inputCls =
    "rounded-2xl border-[1.5px] bg-white px-5 py-4 text-[17px] outline-none transition focus:border-[color:var(--color-brand)]";

  // Both states share the same min-height + max-width so nothing jumps
  // when the form is swapped for the confirmation.
  return (
    <div className="w-full max-w-[540px] min-h-[196px] sm:min-h-[128px]">
      {status === "done" ? (
        <div
          className="flex min-h-[196px] flex-col items-center justify-center gap-1.5 rounded-2xl border px-6 py-6 text-center sm:min-h-[128px]"
          style={{ backgroundColor: "#E9F9F0", borderColor: "#BEEBD3", color: "#0F5132" }}
        >
          <div className="mb-0.5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[22px] shadow-sm">
            🎉
          </div>
          <p className="text-[19px] font-extrabold">You&apos;re on the list!</p>
          <p className="text-[15px] font-semibold opacity-80">
            Keep an eye on your inbox for your invite.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="flex min-h-[196px] flex-col justify-center sm:min-h-[128px]">
          {spotsLeft !== null ? (
            <div className="mb-3 text-[15px] font-extrabold leading-snug" style={{ color: "#15181D" }}>
              {spotsLeft > 0 ? (
                <>
                  🎁 First 12 signups get byeBills{" "}
                  <span style={{ color: "#7A5AF8" }}>forever free</span> —{" "}
                  <span style={{ color: "#7A5AF8" }}>
                    {spotsLeft} spot{spotsLeft === 1 ? "" : "s"} left!
                  </span>
                </>
              ) : (
                <span style={{ color: "#5C6570" }}>
                  All 12 free spots are gone — join the waitlist for early access + a launch discount.
                </span>
              )}
            </div>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputCls} flex-[2]`}
              style={{ borderColor: "#EFE6D2" }}
            />
            <input
              type="text"
              placeholder="First name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${inputCls} flex-1`}
              style={{ borderColor: "#EFE6D2" }}
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="mt-3 w-full rounded-2xl bg-brand py-4 text-[19px] font-extrabold text-white shadow-md transition hover:brightness-105 disabled:opacity-60"
          >
            {status === "loading" ? "Joining…" : "Get early access →"}
          </button>

          <p className="mt-2 min-h-[18px] text-[14px] font-semibold text-[#E5484D]">
            {status === "error" ? msg : ""}
          </p>
        </form>
      )}
    </div>
  );
}

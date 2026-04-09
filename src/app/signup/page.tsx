"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const trimmedEmail = email.trim().toLowerCase();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        if (authError.message === "Failed to fetch") {
          setError(
            "Cannot reach the auth server. The project may be paused — check the Supabase dashboard."
          );
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      // If email confirmation is disabled, user is immediately signed in
      if (data.session) {
        // Create user profile server-side
        await fetch("/api/auth/signup", { method: "POST" });
        router.push("/dashboard");
        router.refresh();
        return;
      }

      setSuccess(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(`Something went wrong: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <div className="text-4xl">📬</div>
          <h1 className="text-xl font-bold text-brand">Check your email</h1>
          <p className="text-sm text-gray-500">
            We sent a confirmation link to <strong>{email}</strong>.
            <br />
            Click it to activate your account, then sign in.
          </p>
          <a
            href="/login"
            className="inline-block rounded-lg bg-brand px-6 py-2 text-sm font-medium text-white hover:bg-brand-hover"
          >
            Go to sign in
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand">ByeBills</h1>
          <p className="text-sm text-gray-500 mt-1">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border px-3 py-3 text-base sm:text-sm"
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-lg border px-3 py-3 text-base sm:text-sm"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <a href="/login" className="text-brand underline">
            Sign in
          </a>
        </p>
      </div>
    </main>
  );
}

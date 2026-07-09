import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getLLMProvider } from "@/lib/llm";

/**
 * Mobile extraction endpoint.
 *
 * Auth: the app sends `Authorization: Bearer <supabase access token>`.
 * Quota: enforced server-side via the consume_extraction() RPC (7-day trial,
 * hard cap of 30 scans/day; pro capped at 200/day). The client cannot bypass
 * or reset this — identity is auth.uid() from the verified JWT.
 * The Gemini key stays here — never in the app.
 *
 * Kept separate from /api/extract (the web flow) so the website is untouched.
 */
export async function POST(request: NextRequest) {
  try {
    return await handle(request);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function tokenClient(token: string) {
  // A client scoped to the caller's JWT so auth.uid() resolves inside RPCs.
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
}

async function handle(request: NextRequest) {
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });
  }

  const supabase = tokenClient(token);

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Reserve one scan atomically. Denied -> 402 with a machine-readable reason.
  const { data: gate, error: gateErr } = await supabase.rpc("consume_extraction").single<{
    allowed: boolean;
    used: number;
    cap: number;
    reason: string; // 'daily_cap' | 'trial_ended' when blocked
  }>();
  if (gateErr) {
    return NextResponse.json({ error: gateErr.message }, { status: 500 });
  }
  if (!gate?.allowed) {
    const daily = gate?.reason === "daily_cap";
    return NextResponse.json(
      {
        error: daily ? "Daily scan limit reached" : "Free trial ended",
        reason: gate?.reason ?? "trial_ended",
        used: gate?.used,
        cap: gate?.cap,
      },
      { status: 402 }
    );
  }

  // Read the uploaded image.
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    await supabase.rpc("refund_extraction");
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const mimeType = file.type || "image/jpeg";

  // Extract via the same LLM provider the web app uses.
  try {
    const provider = getLLMProvider();
    const extraction = await provider.extractInvoice(base64, mimeType);
    return NextResponse.json({
      extraction: extraction.data,
      confidence: extraction.confidence,
      remaining: Math.max(0, gate.cap - gate.used),
      cap: gate.cap,
      used: gate.used,
    });
  } catch (err) {
    // Don't charge the user for our failure.
    await supabase.rpc("refund_extraction");
    const msg = err instanceof Error ? err.message : "LLM extraction failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

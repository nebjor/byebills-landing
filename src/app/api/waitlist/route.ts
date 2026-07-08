import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getPostHogClient } from "@/lib/posthog-server";

// Public endpoint — anyone can join the waitlist. Writes with the service role
// (server-side only) so the table stays locked down.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body.email ?? "").trim().toLowerCase();
    const name = String(body.name ?? "").trim() || null;

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // upsert on email -> re-signing up is idempotent, never errors.
    const { error } = await supabase
      .from("waitlist")
      .upsert({ email, name, source: "landing" }, { onConflict: "email" });

    if (error) {
      return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
    }

    const posthog = getPostHogClient();
    posthog.identify({ distinctId: email, properties: { email, name: name ?? undefined } });
    posthog.capture({ distinctId: email, event: "waitlist_signup_server", properties: { source: "landing" } });
    await posthog.shutdown();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

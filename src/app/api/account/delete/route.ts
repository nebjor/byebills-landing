import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getPostHogClient } from "@/lib/posthog-server";

// Deletes the calling user's account and data. The app sends the user's
// Authorization: Bearer <access token>. We verify it, then delete with the
// service role (admin).
export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization") ?? "";
    const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7) : null;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;

    // 1. Verify the token -> which user is this?
    const asUser = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const {
      data: { user },
      error: userErr,
    } = await asUser.auth.getUser();
    if (userErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2. Delete their data + auth record with the service role.
    const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    // Delete all user-owned rows before removing the auth record.
    await admin.from("app_transactions").delete().eq("user_id", user.id);
    await admin.from("app_hustles").delete().eq("user_id", user.id);
    await admin.from("extraction_usage").delete().eq("user_id", user.id);
    await admin.from("user_entitlements").delete().eq("user_id", user.id);

    const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

    const posthog = getPostHogClient();
    posthog.capture({ distinctId: user.id, event: "account_deleted" });
    await posthog.shutdown();

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

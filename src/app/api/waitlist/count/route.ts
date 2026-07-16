import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Public: returns ONLY the number of waitlist signups (never any emails).
// Used by the landing page to show "X of 12 free spots left".
export const dynamic = "force-dynamic"; // always live, never cached

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { count, error } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });
    if (error) return NextResponse.json({ count: null }, { status: 500 });
    return NextResponse.json({ count: count ?? 0 });
  } catch {
    return NextResponse.json({ count: null }, { status: 500 });
  }
}

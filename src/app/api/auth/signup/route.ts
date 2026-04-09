import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// Server-side profile creation endpoint — called after client-side signup
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Verify the user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Upsert user profile using service role (bypasses RLS)
  const admin = createServiceClient();
  const { error } = await (admin.from("users") as any).upsert(
    { id: user.id, email: user.email ?? null },
    { onConflict: "id" }
  );

  if (error) {
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    // Create user profile if this is a new user
    if (!error && data.user) {
      const admin = createServiceClient();
      await (admin.from("users") as any).upsert(
        { id: data.user.id, email: data.user.email ?? null },
        { onConflict: "id" }
      );
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    // Create user profile if this is a new user
    if (!error && data.user) {
      const { data: existingProfile } = await supabase
        .from("users")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (!existingProfile) {
        await (supabase.from("users") as any).insert({
          id: data.user.id,
          email: data.user.email ?? null,
        });
      }
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}

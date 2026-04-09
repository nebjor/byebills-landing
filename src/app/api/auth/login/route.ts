import { NextResponse } from "next/server";

// Auth is now handled client-side via @supabase/ssr browser client.
// This route is kept as a placeholder to avoid 404s on old clients.
export async function POST() {
  return NextResponse.json(
    { error: "Login is handled client-side. Please refresh the page." },
    { status: 410 }
  );
}

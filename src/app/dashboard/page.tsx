import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import HomeClient from "./home-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Ensure user profile exists (safety net for first login)
  const admin = createServiceClient();
  await (admin.from("users") as any).upsert(
    { id: user.id, email: user.email ?? null },
    { onConflict: "id" }
  );

  // Parallel fetch — all queries at once
  const [{ data: profile }, { data: businesses }, { data: transactions }] =
    await Promise.all([
      supabase.from("users").select("*").eq("id", user.id).single(),
      supabase.from("businesses").select("*").order("created_at", { ascending: false }),
      supabase.from("transactions").select("*").order("document_date", { ascending: false }),
    ]);

  return (
    <HomeClient
      user={user}
      profile={profile}
      businesses={businesses ?? []}
      transactions={transactions ?? []}
    />
  );
}

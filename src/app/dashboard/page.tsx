import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HomeClient from "./home-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: businesses } = await supabase
    .from("businesses")
    .select("*")
    .order("created_at", { ascending: false });

  // Recent 5 transactions for the home overview
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .order("document_date", { ascending: false })
    .limit(5);

  return (
    <HomeClient
      user={user}
      profile={profile}
      businesses={businesses ?? []}
      transactions={transactions ?? []}
    />
  );
}

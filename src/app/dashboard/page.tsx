import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch user's businesses
  const { data: businesses } = await supabase
    .from("businesses")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch all transactions (filtered client-side per business)
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .order("document_date", { ascending: false });

  return (
    <DashboardClient
      user={user}
      businesses={businesses ?? []}
      transactions={transactions ?? []}
    />
  );
}

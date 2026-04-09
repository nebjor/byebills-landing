import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TransactionsClient from "./transactions-client";

export default async function TransactionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: businesses }, { data: transactions }] = await Promise.all([
    supabase.from("businesses").select("*").order("created_at", { ascending: false }),
    supabase.from("transactions").select("*").order("document_date", { ascending: false }),
  ]);

  return (
    <TransactionsClient
      businesses={businesses ?? []}
      transactions={transactions ?? []}
    />
  );
}

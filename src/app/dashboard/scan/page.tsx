import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ScanClient from "./scan-client";

export default async function ScanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: businesses } = await supabase
    .from("businesses")
    .select("*")
    .order("created_at", { ascending: false });

  return <ScanClient businesses={businesses ?? []} />;
}

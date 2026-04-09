import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: businesses }] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).single(),
    supabase.from("businesses").select("*").order("created_at", { ascending: false }),
  ]);

  return (
    <SettingsClient
      user={user}
      profile={profile}
      businesses={(businesses ?? []).filter((b: any) => !b.archived)}
    />
  );
}

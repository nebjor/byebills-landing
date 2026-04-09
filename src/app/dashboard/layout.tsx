import BottomNav from "@/components/bottom-nav";
import OnboardingOverlay from "@/components/onboarding-overlay";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("businesses")
    .select("*", { count: "exact", head: true });

  return (
    <>
      <OnboardingOverlay hasBusiness={(count ?? 0) > 0} />
      <main className="mx-auto max-w-lg px-4 pt-4 pb-24">
        {children}
      </main>
      <BottomNav />
    </>
  );
}

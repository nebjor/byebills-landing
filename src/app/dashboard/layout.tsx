import BottomNav from "@/components/bottom-nav";
import OnboardingOverlay from "@/components/onboarding-overlay";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <OnboardingOverlay />
      <main className="mx-auto max-w-lg px-4 pt-4 pb-24">
        {children}
      </main>
      <BottomNav />
    </>
  );
}

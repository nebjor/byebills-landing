"use client";

import { useEffect, useState } from "react";
import posthog from "posthog-js";

// A/B test for the hero headline.
// To activate: in PostHog -> Experiments, create an experiment on the
// feature-flag key "landing-headline" with variants: control | punchy.
// Goal metric: the "waitlist_joined" event (already captured on submit).
// Until the experiment exists, getFeatureFlag returns undefined and we
// render "control" -> shipping this changes nothing visible yet.
const VARIANTS: Record<string, React.ReactNode> = {
  control: (
    <>
      Meet Billie,
      <br />
      your pocket
      <br />
      bookkeeper
    </>
  ),
  punchy: (
    <>
      Bookkeeping
      <br />
      that does
      <br />
      itself
    </>
  ),
};

export default function HeadlineExperiment() {
  // Server + first client render use "control" so hydration matches.
  const [variant, setVariant] = useState<string>("control");

  useEffect(() => {
    posthog.onFeatureFlags(() => {
      const v = posthog.getFeatureFlag("landing-headline");
      if (typeof v === "string" && VARIANTS[v]) setVariant(v);
    });
  }, []);

  return (
    <h1 className="text-[52px] font-extrabold leading-[0.98] tracking-[-2.5px] sm:text-[64px] lg:text-[72px]">
      {VARIANTS[variant]}
    </h1>
  );
}

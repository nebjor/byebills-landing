# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the byeBills Next.js App Router project. PostHog is now initialized via `instrumentation-client.ts` (the recommended approach for Next.js 15.3+), with a reverse proxy configured in `next.config.ts` to route tracking requests through `/ingest` and reduce ad-blocker interception. Server-side event tracking uses `posthog-node` via a shared client in `src/lib/posthog-server.ts`. All 8 key business events are captured across 6 files, covering the full user journey from waitlist signup through receipt scanning, transaction creation, and account deletion. Users are identified server-side on signup and on waitlist join.

| Event name | Description | File |
|---|---|---|
| `waitlist_joined` | User successfully submitted the waitlist form on the landing page. | `src/components/waitlist-form.tsx` |
| `waitlist_signup_server` | Server confirmed a waitlist signup was persisted to the database. | `src/app/api/waitlist/route.ts` |
| `user_signed_up` | Server created a user profile after Supabase authentication signup. | `src/app/api/auth/signup/route.ts` |
| `receipt_scan_started` | User initiated a receipt scan by selecting a file or starting the camera. | `src/components/scan-modal.tsx` |
| `receipt_extracted` | Server successfully extracted invoice data from a receipt using the LLM. | `src/app/api/extract/route.ts` |
| `receipt_scan_confirmed` | User reviewed and confirmed the extracted receipt data before saving. | `src/components/scan-modal.tsx` |
| `transaction_created` | Server saved a new transaction to the database. | `src/app/api/transactions/route.ts` |
| `account_deleted` | Server confirmed a user account and all associated data was deleted. | `src/app/api/account/delete/route.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) dashboard](https://eu.posthog.com/project/219399/dashboard/804433)
- [Waitlist signups (wizard)](https://eu.posthog.com/project/219399/insights/tdol2ziA) — daily waitlist conversion bar chart
- [New user signups (wizard)](https://eu.posthog.com/project/219399/insights/A0YM1Pq3) — daily signup trend line
- [Receipt scan funnel (wizard)](https://eu.posthog.com/project/219399/insights/bUcGcBjm) — 4-step funnel: scan started → extracted → confirmed → transaction created
- [Transactions by type (wizard)](https://eu.posthog.com/project/219399/insights/U5A56fll) — stacked bar of income vs expense transactions over time
- [Account deletions (wizard)](https://eu.posthog.com/project/219399/insights/1S6t8lng) — weekly churn indicator

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example` and any monorepo/bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.
- [ ] Confirm the returning-visitor path also calls `identify` — the current integration identifies on signup but a user who returns after a session break will be on an anonymous distinct ID until the app calls `posthog.identify()` again on load.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-zinc-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold tracking-tight text-brand">ByeBills</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-zinc-600 hover:text-zinc-900">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pt-20 pb-16 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-1.5 text-xs text-zinc-600">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
          Built for Swiss side-hustlers
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl leading-[1.1]">
          Stop doing bookkeeping.
          <br />
          <span className="text-zinc-400">Start scanning.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-500 leading-relaxed">
          Snap a photo of any invoice or bill. AI extracts the data. You verify with one tap.
          Done &mdash; your books are updated. Works for all your businesses.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20"
          >
            Start scanning for free
          </Link>
          <Link
            href="#how-it-works"
            className="rounded-full border border-zinc-200 px-8 py-3 text-sm font-medium text-zinc-600 hover:border-zinc-300 transition-colors"
          >
            See how it works
          </Link>
        </div>

        <p className="mt-4 text-xs text-zinc-400">
          Free forever for personal use. No credit card needed.
        </p>
      </section>

      {/* Hero visual — mockup */}
      <section className="mx-auto max-w-4xl px-6 pb-20">
        <div className="relative rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:p-8 shadow-xl shadow-zinc-200/50">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            {/* Step mock 1 */}
            <div className="rounded-xl bg-white border border-zinc-100 p-6 shadow-sm">
              <div className="text-3xl mb-3">📸</div>
              <div className="text-sm font-medium">Scan</div>
              <div className="mt-1 text-xs text-zinc-400">Camera or PDF upload</div>
            </div>
            {/* Step mock 2 */}
            <div className="rounded-xl bg-white border border-zinc-100 p-6 shadow-sm">
              <div className="text-3xl mb-3">🤖</div>
              <div className="text-sm font-medium">AI Extracts</div>
              <div className="mt-1 text-xs text-zinc-400">Amount, date, vendor, type</div>
            </div>
            {/* Step mock 3 */}
            <div className="rounded-xl bg-white border border-zinc-100 p-6 shadow-sm">
              <div className="text-3xl mb-3">✅</div>
              <div className="text-sm font-medium">Booked</div>
              <div className="mt-1 text-xs text-zinc-400">Verified &amp; synced</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain point */}
      <section className="border-y border-zinc-100 bg-zinc-50">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            You have 3 side businesses.
            <br />
            <span className="text-zinc-400">And zero time for spreadsheets.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-zinc-500 leading-relaxed">
            You&apos;re juggling gigs, clients, and invoices across multiple businesses.
            Every receipt gets shoved in a drawer. Tax season is a nightmare.
            Sound familiar?
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">
            How it works
          </p>
          <h2 className="text-2xl font-bold sm:text-3xl">
            From invoice to bookkeeping in 30 seconds
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white text-xl font-bold shadow-lg">
              1
            </div>
            <h3 className="font-semibold mb-1">Scan or upload</h3>
            <p className="text-sm text-zinc-500">
              Point your camera at any invoice or bill. Or upload a PDF. Works with Swiss QR invoices,
              handwritten receipts, anything.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white text-xl font-bold shadow-lg">
              2
            </div>
            <h3 className="font-semibold mb-1">AI reads it for you</h3>
            <p className="text-sm text-zinc-500">
              Our AI extracts the amount, vendor, date, reference number, and classifies it as
              income or expense. Instantly.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white text-xl font-bold shadow-lg">
              3
            </div>
            <h3 className="font-semibold mb-1">Verify &amp; done</h3>
            <p className="text-sm text-zinc-500">
              Check the extracted data, tap confirm. It&apos;s saved and synced to your
              Google Sheet automatically. No manual entry ever.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-zinc-100 bg-zinc-50">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">
              Features
            </p>
            <h2 className="text-2xl font-bold sm:text-3xl">
              Built for how you actually work
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <div className="text-2xl mb-3">🏢</div>
              <h3 className="font-semibold mb-1">Multi-business</h3>
              <p className="text-sm text-zinc-500">
                Switch between businesses in one tap. Each has its own ledger,
                integrations, and Google Sheet.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <div className="text-2xl mb-3">📱</div>
              <h3 className="font-semibold mb-1">Mobile-first</h3>
              <p className="text-sm text-zinc-500">
                Designed for your phone. Scan invoices on the go, right from the
                construction site, studio, or coffee shop.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <div className="text-2xl mb-3">🔄</div>
              <h3 className="font-semibold mb-1">Google Sheets sync</h3>
              <p className="text-sm text-zinc-500">
                Every confirmed transaction lands in your spreadsheet automatically.
                Your accountant will love you.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <div className="text-2xl mb-3">🧠</div>
              <h3 className="font-semibold mb-1">AI-powered extraction</h3>
              <p className="text-sm text-zinc-500">
                State-of-the-art AI reads invoices, bills, and receipts in any language.
                Handles messy handwriting too.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <div className="text-2xl mb-3">🔍</div>
              <h3 className="font-semibold mb-1">Duplicate detection</h3>
              <p className="text-sm text-zinc-500">
                Accidentally scan the same invoice twice? We catch it before it hits
                your books.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <div className="text-2xl mb-3">🇨🇭</div>
              <h3 className="font-semibold mb-1">Swiss-ready</h3>
              <p className="text-sm text-zinc-500">
                CHF default, Twint payments, Swiss QR invoice support.
                Built in Zurich, for Swiss businesses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof / future */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl mb-4">
          Coming soon
        </h2>
        <p className="text-zinc-500 mb-8">
          We&apos;re building integrations with the tools Swiss businesses already use.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {["Bexio", "Stripe", "Twint", "Swiss Banking APIs", "MWST Reporting"].map((name) => (
            <span
              key={name}
              className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-500"
            >
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-zinc-100 bg-zinc-50">
        <div className="mx-auto max-w-2xl px-6 py-20">
          <h2 className="text-2xl font-bold text-center mb-10">FAQ</h2>
          <div className="space-y-6">
            {[
              {
                q: "Is it really free?",
                a: "Yes. The core scanning and bookkeeping features are free. We'll add premium features later for power users.",
              },
              {
                q: "Does it work with Swiss QR invoices?",
                a: "Yes! Our AI can read Swiss QR invoices, traditional invoices, handwritten receipts, and PDFs in any language.",
              },
              {
                q: "I have multiple side businesses. Can I keep them separate?",
                a: "Absolutely. Multi-business is a core feature. Each business gets its own ledger and Google Sheet sync.",
              },
              {
                q: "Where is my data stored?",
                a: "In Supabase (PostgreSQL) hosted in Zurich, Switzerland. Your data stays in Switzerland.",
              },
              {
                q: "Do I need an accountant?",
                a: "ByeBills doesn't replace an accountant, but it makes their job (and yours) much easier by keeping your books organized automatically.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-zinc-200 pb-5">
                <h3 className="font-medium mb-1">{q}</h3>
                <p className="text-sm text-zinc-500">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl mb-4">
          Your invoices won&apos;t scan themselves.
        </h2>
        <p className="text-zinc-500 mb-8">
          Well, actually — with ByeBills they kind of do.
        </p>
        <Link
          href="/signup"
          className="inline-flex rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20"
        >
          Start scanning for free
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-8 flex flex-col items-center gap-2 text-xs text-zinc-400">
          <span className="font-semibold text-brand">ByeBills</span>
          <span>Invoice Scanner &amp; Bookkeeper for Swiss Side-Hustlers</span>
          <span>Built in Zurich 🇨🇭</span>
        </div>
      </footer>
    </>
  );
}

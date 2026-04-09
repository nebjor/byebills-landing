import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* ===== HERO (dark) ===== */}
      <div className="bg-brand-hero">
        {/* Nav */}
        <nav className="sticky top-0 z-40 bg-brand-hero/90 backdrop-blur-lg">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <span className="text-[18px] font-medium tracking-tight">
              <span className="text-white">Bye</span>
              <span className="text-brand">Bills</span>
            </span>
            <div className="flex items-center gap-6">
              <Link href="#how-it-works" className="hidden sm:inline text-[14px] text-white/55 hover:text-white/80 transition-colors">
                How it works
              </Link>
              <Link href="#pricing" className="hidden sm:inline text-[14px] text-white/55 hover:text-white/80 transition-colors">
                Pricing
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-brand px-[18px] py-2 text-[14px] font-medium text-brand-dark hover:brightness-110 transition"
              >
                Get started free
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero content */}
        <section className="mx-auto max-w-5xl px-6 pt-16 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left column — text */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-[20px] border border-brand/30 bg-brand/12 px-4 py-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-brand" />
                <span className="text-[12px] font-medium text-brand">Built for Swiss side-hustlers</span>
              </div>

              {/* Headline */}
              <h1 className="text-[42px] sm:text-[52px] font-medium text-white leading-[1.05] tracking-[-1.5px]">
                Stop doing
                <br />
                bookkeeping.
                <br />
                <span className="text-brand">Start scanning.</span>
              </h1>

              {/* Subline */}
              <p className="max-w-[420px] text-[17px] text-white/55 leading-[1.6]">
                Snap any invoice or bill. AI reads it instantly. One tap to confirm &mdash; your
                books update automatically. For all your businesses.
              </p>

              {/* CTA row */}
              <div className="flex items-center gap-6">
                <Link
                  href="/signup"
                  className="rounded-[10px] bg-brand px-6 py-3 text-[15px] font-medium text-brand-dark hover:brightness-110 transition"
                >
                  Start scanning free
                </Link>
                <Link
                  href="#how-it-works"
                  className="text-[14px] text-white/45 hover:text-white/70 transition-colors"
                >
                  See how it works →
                </Link>
              </div>

              {/* Social proof row */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[
                    { initials: "MK", bg: "#2d6a4f" },
                    { initials: "AS", bg: "#1b4332" },
                    { initials: "JR", bg: "#40916c" },
                    { initials: "LP", bg: "#52b788" },
                  ].map((a) => (
                    <div
                      key={a.initials}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-hero text-[10px] font-medium text-white"
                      style={{ backgroundColor: a.bg }}
                    >
                      {a.initials}
                    </div>
                  ))}
                </div>
                <span className="text-[13px] text-white/40">
                  Free forever for personal use · No credit card needed
                </span>
              </div>

              {/* Step indicators */}
              <div className="flex items-center gap-3">
                {[
                  { num: "1", label: "Scan" },
                  { num: "2", label: "AI extracts" },
                  { num: "3", label: "Booked" },
                ].map((step, i) => (
                  <div key={step.num} className="flex items-center gap-3">
                    {i > 0 && <span className="text-[12px] text-white/20">→</span>}
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-brand/30 bg-brand/15 text-[11px] text-brand font-medium">
                        {step.num}
                      </span>
                      <span className="text-[12px] text-white/35">{step.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column — phone mockup */}
            <div className="hidden lg:flex justify-center">
              <div className="w-[240px] rounded-[28px] border border-brand/20 bg-[#1a2820] p-3">
                <div className="rounded-[20px] bg-[#0d1410] overflow-hidden">
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-4 pt-3 pb-1">
                    <span className="text-[11px] text-white/50 font-medium">9:41</span>
                    <span className="text-white/50 text-[10px]">•••</span>
                  </div>

                  {/* Header */}
                  <div className="bg-[#111f17] px-4 py-3">
                    <p className="text-[13px] font-medium text-white">Scan invoice</p>
                    <p className="text-[11px] text-white/35">Point camera at any bill or invoice</p>
                  </div>

                  {/* Scan area */}
                  <div className="px-4 py-4">
                    <div className="relative h-[120px] rounded-xl border-[1.5px] border-dashed border-brand/40 flex flex-col items-center justify-center">
                      {/* Corner brackets */}
                      <svg className="absolute top-2 left-2 h-4 w-4 text-brand" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 6V2a1 1 0 0 1 1-1h4" /><path d="M1 10v4a1 1 0 0 0 1 1h4" /></svg>
                      <svg className="absolute top-2 right-2 h-4 w-4 text-brand" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6V2a1 1 0 0 0-1-1h-4" /><path d="M15 10v4a1 1 0 0 1-1 1h-4" /></svg>

                      {/* Camera icon */}
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/15 mb-2">
                        <svg className="h-5 w-5 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" /><path d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" /></svg>
                      </div>
                      <span className="text-[11px] text-white/40">Scanning…</span>
                    </div>
                  </div>

                  {/* AI extracted card */}
                  <div className="px-4 pb-3">
                    <div className="rounded-[10px] border border-brand/15 bg-[#111f17] p-3 space-y-2">
                      <p className="text-[10px] font-medium text-brand">AI extracted</p>
                      <div className="space-y-1.5">
                        {[
                          { label: "Vendor", value: "Migros AG", highlight: false },
                          { label: "Amount", value: "CHF 284.50", highlight: true },
                          { label: "Date", value: "08.04.2026", highlight: false },
                          { label: "Type", value: "Expense", highlight: false },
                        ].map((row) => (
                          <div key={row.label} className="flex justify-between">
                            <span className="text-[11px] text-white/35">{row.label}</span>
                            <span className={`text-[11px] font-medium ${row.highlight ? "text-brand" : "text-white/80"}`}>
                              {row.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Confirm button */}
                  <div className="px-4 pb-4">
                    <div className="w-full rounded-lg bg-brand py-2.5 text-center text-[12px] font-medium text-brand-dark">
                      Confirm &amp; book
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ===== BELOW HERO (light) ===== */}

      {/* Pain point */}
      <section className="border-y border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl text-zinc-900">
            You have 3 side businesses.
            <br />
            <span className="text-zinc-600">And zero time for spreadsheets.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-zinc-600 leading-relaxed">
            You&apos;re juggling gigs, clients, and invoices across multiple businesses.
            Every receipt gets shoved in a drawer. Tax season is a nightmare.
            Sound familiar?
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-brand uppercase tracking-wider mb-2">
            How it works
          </p>
          <h2 className="text-2xl font-bold sm:text-3xl text-zinc-900">
            From invoice to bookkeeping in 30 seconds
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white text-xl font-bold shadow-lg">
              1
            </div>
            <h3 className="font-semibold mb-1 text-zinc-900">Scan or upload</h3>
            <p className="text-sm text-zinc-600">
              Point your camera at any invoice or bill. Or upload a PDF. Works with Swiss QR invoices,
              handwritten receipts, anything.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white text-xl font-bold shadow-lg">
              2
            </div>
            <h3 className="font-semibold mb-1 text-zinc-900">AI reads it for you</h3>
            <p className="text-sm text-zinc-600">
              Our AI extracts the amount, vendor, date, reference number, and classifies it as
              income or expense. Instantly.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white text-xl font-bold shadow-lg">
              3
            </div>
            <h3 className="font-semibold mb-1 text-zinc-900">Verify &amp; done</h3>
            <p className="text-sm text-zinc-600">
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
            <p className="text-sm font-medium text-brand uppercase tracking-wider mb-2">
              Features
            </p>
            <h2 className="text-2xl font-bold sm:text-3xl text-zinc-900">
              Built for how you actually work
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <div className="text-2xl mb-3">🏢</div>
              <h3 className="font-semibold mb-1 text-zinc-900">Multi-business</h3>
              <p className="text-sm text-zinc-600">
                Switch between businesses in one tap. Each has its own ledger,
                integrations, and Google Sheet.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <div className="text-2xl mb-3">📱</div>
              <h3 className="font-semibold mb-1 text-zinc-900">Mobile-first</h3>
              <p className="text-sm text-zinc-600">
                Designed for your phone. Scan invoices on the go, right from the
                construction site, studio, or coffee shop.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <div className="text-2xl mb-3">🔄</div>
              <h3 className="font-semibold mb-1 text-zinc-900">Google Sheets sync</h3>
              <p className="text-sm text-zinc-600">
                Every confirmed transaction lands in your spreadsheet automatically.
                Your accountant will love you.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <div className="text-2xl mb-3">🧠</div>
              <h3 className="font-semibold mb-1 text-zinc-900">AI-powered extraction</h3>
              <p className="text-sm text-zinc-600">
                State-of-the-art AI reads invoices, bills, and receipts in any language.
                Handles messy handwriting too.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <div className="text-2xl mb-3">🔍</div>
              <h3 className="font-semibold mb-1 text-zinc-900">Duplicate detection</h3>
              <p className="text-sm text-zinc-600">
                Accidentally scan the same invoice twice? We catch it before it hits
                your books.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <div className="text-2xl mb-3">🇨🇭</div>
              <h3 className="font-semibold mb-1 text-zinc-900">Swiss-ready</h3>
              <p className="text-sm text-zinc-600">
                CHF default, Twint payments, Swiss QR invoice support.
                Built in Zurich, for Swiss businesses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof / future */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl mb-4 text-zinc-900">
          Coming soon
        </h2>
        <p className="text-zinc-600 mb-8">
          We&apos;re building integrations with the tools Swiss businesses already use.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {["Bexio", "Stripe", "Twint", "Swiss Banking APIs", "MWST Reporting"].map((name) => (
            <span
              key={name}
              className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-700"
            >
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-zinc-100 bg-zinc-50">
        <div className="mx-auto max-w-2xl px-6 py-20">
          <h2 className="text-2xl font-bold text-center mb-10 text-zinc-900">FAQ</h2>
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
                <h3 className="font-medium mb-1 text-zinc-900">{q}</h3>
                <p className="text-sm text-zinc-600">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl mb-4 text-zinc-900">
          Your invoices won&apos;t scan themselves.
        </h2>
        <p className="text-zinc-600 mb-8">
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

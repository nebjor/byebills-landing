import Link from "next/link";

export default function Privacy() {
  return (
    <div style={{ backgroundColor: "#FBF4E6", color: "#15181D", fontFamily: "var(--font-nunito)" }} className="min-h-screen">
      <div className="mx-auto max-w-2xl px-6 py-14">
        <Link href="/" className="text-[14px] font-bold text-brand">
          ← byeBills
        </Link>
        <h1 className="mt-6 text-[34px] font-extrabold tracking-[-1px]">Privacy Policy</h1>
        <p className="mt-2 text-[14px]" style={{ color: "#5C6570" }}>
          Last updated: 7 July 2026
        </p>

        <p className="mt-6 rounded-xl border p-4 text-[13px] italic" style={{ borderColor: "#EFE6D2", color: "#5C6570" }}>
          This policy is provided as a starting template and is not legal advice. Have it reviewed by a qualified lawyer
          before you publish or submit to the App Store.
        </p>

        <div className="mt-8 space-y-6 text-[15px] leading-relaxed" style={{ color: "#3A424C" }}>
          <p>
            byeBills (&quot;byeBills&quot;, &quot;we&quot;, &quot;us&quot;) provides a mobile app that lets you scan
            receipts and invoices, keep track of your income and expenses, and export that data. This policy explains
            what personal data we process and why. It applies to the byeBills app and website.
          </p>

          <Section title="1. Who is responsible">
            The data controller is byeBills, Switzerland. For any privacy request, contact us at{" "}
            <a href="mailto:jneber@proton.me" className="font-semibold text-brand">
              jneber@proton.me
            </a>
            .
          </Section>

          <Section title="2. What we collect">
            <List
              items={[
                "Account data: your name and email address, provided when you sign in with Apple or Google.",
                "Financial data you add: transactions, amounts, dates, categories, vendors, notes, and the receipt/invoice photos you scan or upload.",
                "Usage & device data: basic diagnostics and technical information needed to operate the app (e.g. app version, error logs).",
              ]}
            />
          </Section>

          <Section title="3. How we use your data">
            We use your data to provide the service: to store and display your bookkeeping records, run receipt
            extraction, sync your data across your devices, and keep the app secure and working. We do not sell your
            personal data, and we do not use it for advertising.
          </Section>

          <Section title="4. AI processing (third-party)">
            When you scan a receipt or invoice, the image is sent to a third-party AI provider (Google, via the Gemini
            API) solely to extract information such as the amount, date, vendor and category. The provider processes the
            image to return this data and does not use it to train models on our instructions. AI output can be
            inaccurate — you are always shown the extracted data to review and edit before it is saved.
          </Section>

          <Section title="5. Legal bases">
            Where the EU GDPR or the Swiss FADP applies, we process your data to perform our contract with you (to
            provide the app), on the basis of your consent (which you may withdraw at any time), and for our legitimate
            interest in operating and securing the service.
          </Section>

          <Section title="6. Sharing">
            We share data only with providers that help us run byeBills: our AI provider (for extraction, see §4), our
            hosting/database provider (Supabase), and the app stores that process your subscription. These providers act
            under agreements requiring appropriate protection of your data. We may also disclose data where legally
            required.
          </Section>

          <Section title="7. Storage, security & retention">
            Your data is stored with our infrastructure provider using industry-standard security measures. Receipt
            images are kept private to your account. We retain your data for as long as your account is active; when you
            delete your account or data, we delete it (subject to any retention required by law).
          </Section>

          <Section title="8. Your rights">
            You can access, correct, export, or delete your data at any time from within the app or by contacting us. You
            may withdraw consent, and — if you are in the EU/EEA, UK or Switzerland — lodge a complaint with your data
            protection authority.
          </Section>

          <Section title="9. Children">
            byeBills is not directed to children and is intended for users aged 16 and older. We do not knowingly collect
            data from children.
          </Section>

          <Section title="10. International transfers">
            Your data may be processed outside your country (including by the providers named above). Where required, we
            rely on appropriate safeguards for such transfers.
          </Section>

          <Section title="11. Changes">
            We may update this policy from time to time. Material changes will be reflected by the &quot;last
            updated&quot; date above.
          </Section>

          <Section title="12. Contact">
            Questions or requests:{" "}
            <a href="mailto:jneber@proton.me" className="font-semibold text-brand">
              jneber@proton.me
            </a>
            .
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-1.5 text-[18px] font-bold" style={{ color: "#15181D" }}>
        {title}
      </h2>
      <div>{children}</div>
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {items.map((it) => (
        <li key={it}>{it}</li>
      ))}
    </ul>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { breadcrumbSchema } from "@/lib/jsonld";

const TITLE = "Risk Disclosures | Harvest";
const DESCRIPTION =
  "Risk Disclosures statement covering operational, blockchain, third-party, market, and regulatory risks associated with the Harvest website and app.";
const URL = `${SITE_URL}/disclosures`;
const LAST_UPDATED = "May 3, 2026";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    siteName: SITE_NAME,
    type: "article",
  },
  alternates: { canonical: URL },
};

// Section list mirrors the structure of the operator's published Risk
// Disclosures. Body copy for each section is intentionally a placeholder;
// paste the authoritative legal text directly into each <section> below at
// content-management time. Section IDs are stable so links from elsewhere
// on the site can deep-link to specific clauses.
const SECTIONS = [
  { id: "summary", label: "Important risk summary" },
  { id: "warranties", label: "1. Disclaimer of warranties" },
  { id: "operational", label: "2. Operational risks" },
  { id: "blockchain", label: "3. Blockchain risks" },
  { id: "third-party", label: "4. Third-party risks" },
  { id: "no-insurance", label: "5. No insurance or government backing" },
  { id: "audits", label: "6. Audit status" },
  { id: "market", label: "7. Market risks" },
  { id: "regulatory", label: "8. Regulatory risks" },
  { id: "incident-reporting", label: "9. Incident reporting and transparency" },
  { id: "mitigation", label: "10. Mitigation measures" },
];

function Placeholder() {
  return (
    <p style={{ fontStyle: "italic", color: "var(--ink-3)" }}>
      Authoritative legal text pending publication.
    </p>
  );
}

export default function DisclosuresPage() {
  const crumbs = [
    { name: "Home", url: SITE_URL },
    { name: "Risk Disclosures" },
  ];

  return (
    <main className="methodology-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }}
      />

      <div className="meth-header">
        <nav className="meth-crumbs mono dim">
          <Link href="/">Home</Link>
          <span className="sep">›</span>
          <span>Risk Disclosures</span>
        </nav>
        <h1 className="meth-title">Risk Disclosures</h1>
        <p className="meth-subtitle">
          Risks associated with using the Harvest website, the app, and the
          underlying smart-contract systems they reference.
        </p>
        <p className="meth-version mono dim">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="meth-layout">
        <aside className="meth-toc" aria-label="Page sections">
          <p className="meth-toc-label mono">On this page</p>
          <ul className="meth-toc-list">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="meth-toc-link">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        <article className="meth-body">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="meth-section">
              <h2 className="meth-h2">{s.label}</h2>
              <Placeholder />
            </section>
          ))}

          <section className="meth-section">
            <p>
              This Disclosure is incorporated by reference into, and forms
              part of, the{" "}
              <Link href="/terms" className="meth-link">Terms of Use</Link>.
              For a higher-level overview of how risk categories are
              communicated on individual product pages, see the{" "}
              <Link href="/risk-framework" className="meth-link">
                Risk Framework
              </Link>
              . For the methodology behind APY, TVL and ranking, see the{" "}
              <Link href="/methodology" className="meth-link">methodology</Link>{" "}
              page.
            </p>
            <p>
              Questions about this document can be sent to{" "}
              <a href="mailto:support@harvest.finance" className="meth-link">
                support@harvest.finance
              </a>
              .
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}

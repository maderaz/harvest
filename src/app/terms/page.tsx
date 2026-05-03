import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { breadcrumbSchema } from "@/lib/jsonld";

const TITLE = "Terms of Use | Harvest";
const DESCRIPTION =
  "Terms of Use governing access to and use of the Harvest website and app.";
const URL = `${SITE_URL}/terms`;
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

// Section list mirrors the structure of the operator's published Terms of
// Use. Body copy for each section is intentionally a placeholder; paste the
// authoritative legal text directly into each <section> below at content-
// management time. Section IDs are stable so links from elsewhere on the
// site can deep-link to specific clauses.
const SECTIONS = [
  { id: "definitions", label: "1. Definitions and interpretation" },
  { id: "availability", label: "2. Availability, access and updates" },
  { id: "eligibility", label: "3. Eligibility" },
  { id: "user-interaction", label: "4. User interaction with the Website and the Protocol" },
  { id: "permitted-use", label: "5. Permitted use" },
  { id: "prohibited-uses", label: "6. Prohibited uses" },
  { id: "no-financial-advice", label: "7. No financial advice" },
  { id: "risk-acknowledgement", label: "8. Risk disclosure acknowledgements" },
  { id: "third-parties", label: "9. Third-party protocols, services, wallets, and content" },
  { id: "license", label: "10. Licence" },
  { id: "privacy", label: "11. Privacy policy" },
  { id: "intellectual-property", label: "12. Intellectual property" },
  { id: "indemnification", label: "13. Indemnification" },
  { id: "limitation-of-liability", label: "14. Limitation of liability" },
  { id: "warranties", label: "15. Warranties and representations" },
  { id: "fees", label: "16. Fees and transactions" },
  { id: "no-warranties", label: "17. No warranties" },
  { id: "dispute-resolution", label: "18. Dispute resolution and arbitration" },
  { id: "class-action-waiver", label: "19. Class action and jury trial waiver" },
  { id: "governing-law", label: "20. Governing law and disputes" },
  { id: "electronic-communications", label: "21. Electronic communications" },
  { id: "force-majeure", label: "22. Force majeure" },
  { id: "language", label: "23. Language" },
  { id: "validity", label: "24. Validity and enforceability" },
  { id: "entire-agreement", label: "25. Entire representation, consent, and agreement" },
];

function Placeholder() {
  return (
    <p style={{ fontStyle: "italic", color: "var(--ink-3)" }}>
      Authoritative legal text pending publication.
    </p>
  );
}

export default function TermsPage() {
  const crumbs = [
    { name: "Home", url: SITE_URL },
    { name: "Terms of Use" },
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
          <span>Terms of Use</span>
        </nav>
        <h1 className="meth-title">Terms of Use</h1>
        <p className="meth-subtitle">
          These Terms govern access to and use of the Harvest website and app.
          By accessing the site, you agree to be bound by them.
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
              For any question about these Terms, contact{" "}
              <a href="mailto:support@harvest.finance" className="meth-link">
                support@harvest.finance
              </a>
              . The companion documents are the{" "}
              <Link href="/disclosures" className="meth-link">
                Risk Disclosures
              </Link>{" "}
              and the{" "}
              <Link href="/privacy" className="meth-link">
                Privacy Policy
              </Link>
              , both of which are incorporated by reference.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}

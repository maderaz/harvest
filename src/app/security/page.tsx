import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { breadcrumbSchema } from "@/lib/jsonld";

const TITLE = "Security & Audits | Harvest";
const DESCRIPTION =
  "Independent security audits of the Harvest smart-contract system, vulnerability disclosure, and how to report issues.";
const URL = `${SITE_URL}/security`;

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

interface Audit {
  id: string;
  firm: string;
  reportUrl: string;
  summary: string;
}

const AUDITS: Audit[] = [
  {
    id: "haechi",
    firm: "Haechi",
    reportUrl:
      "https://github.com/harvest-finance/harvest/blob/master/audits/Haechi-Harvest.pdf",
    summary:
      "Haechi flagged one major-severity issue, originally surfaced by community review and already remediated by the time the report landed, plus five minor-severity findings. Four of the minor findings reflected deliberate decentralization design choices rather than defects; the remaining minor item was patched.",
  },
  {
    id: "peckshield",
    firm: "PeckShield",
    reportUrl:
      "https://github.com/harvest-finance/harvest/blob/master/audits/PeckShield-Harvest.pdf",
    summary:
      "PeckShield's primary finding concerned the privileged role of the 0xf00d deployer address. Following community discussion, timelock mechanisms were introduced so that depositors can exit positions before any deployer action is executed. A separate issue in CRVStrategyStable's depositArbCheck() was caught by community review and patched ahead of the final report. Remaining items were either non-informational or explicit design decisions tied to the project's decentralization model.",
  },
  {
    id: "certik",
    firm: "CertiK",
    reportUrl:
      "https://github.com/harvest-finance/harvest/blob/master/audits/CertiK-Harvest.pdf",
    summary:
      "CertiK reported one minor-severity finding which was determined to be a false positive: the conditions described could not occur under the production deployment and configuration. Remaining items were optimization suggestions and language-level alternatives with no security impact.",
  },
  {
    id: "least-authority",
    firm: "Least Authority",
    reportUrl:
      "https://github.com/harvest-finance/harvest/blob/master/audits/LeastAuthority-Harvest.pdf",
    summary:
      "Least Authority did not identify issues beyond those already known or already remediated. The engagement also covered review of the proposed vault redesign and informed subsequent direction on that work.",
  },
];

export default function SecurityPage() {
  const crumbs = [
    { name: "Home", url: SITE_URL },
    { name: "Security & Audits" },
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
          <span>Security &amp; Audits</span>
        </nav>
        <h1 className="meth-title">Security &amp; Audits</h1>
        <p className="meth-subtitle">
          Independent reviews of the Harvest smart-contract system, plus
          how to report a security issue.
        </p>
      </div>

      <div className="meth-layout">
        <aside className="meth-toc" aria-label="Page sections">
          <p className="meth-toc-label mono">On this page</p>
          <ul className="meth-toc-list">
            <li><a href="#approach" className="meth-toc-link">Approach to security</a></li>
            <li><a href="#audits" className="meth-toc-link">Audit reports</a></li>
            {AUDITS.map((a) => (
              <li key={a.id}>
                <a href={`#${a.id}`} className="meth-toc-link" style={{ paddingLeft: 14 }}>
                  {a.firm}
                </a>
              </li>
            ))}
            <li><a href="#reporting" className="meth-toc-link">Reporting an issue</a></li>
            <li><a href="#scope-and-caveats" className="meth-toc-link">Scope and caveats</a></li>
          </ul>
        </aside>

        <article className="meth-body">
          <section id="approach" className="meth-section">
            <h2 className="meth-h2">Approach to security</h2>
            <p>
              The Harvest contract system has been operating onchain since
              2020. Across that period the codebase has been reviewed by
              multiple independent security firms. Findings are summarized
              below alongside links to the original audit reports, which
                are published in full so anyone can read the underlying
              detail rather than only our characterisation of it.
            </p>
            <p>
              An audit is one input to security, not a guarantee of it.
              No audit, including the ones below, certifies that a
              codebase is free of bugs. Smart-contract risk persists even
              for audited systems and is one of the categories documented
              on the{" "}
              <Link href="/risk-framework" className="meth-link">
                risk framework
              </Link>{" "}
              page.
            </p>
          </section>

          <section id="audits" className="meth-section">
            <h2 className="meth-h2">Audit reports</h2>
            <p>
              Reports are linked to the public GitHub mirror under{" "}
              <a
                href="https://github.com/harvest-finance/harvest/tree/master/audits"
                className="meth-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                harvest-finance/harvest/audits
              </a>
              . Each summary below describes the substantive findings; for
              the precise scope and severity classifications used by each
              firm, refer to the original PDF.
            </p>

            {AUDITS.map((a) => (
              <div key={a.id} id={a.id} style={{ paddingTop: 12 }}>
                <h3 className="meth-h3">{a.firm}</h3>
                <p>{a.summary}</p>
                <p>
                  <a
                    href={a.reportUrl}
                    className="meth-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read the {a.firm} report (PDF)
                  </a>
                </p>
              </div>
            ))}
          </section>

          <section id="reporting" className="meth-section">
            <h2 className="meth-h2">Reporting an issue</h2>
            <p>
              Security disclosures, suspected vulnerabilities, and
              responsible-disclosure inquiries should be sent to{" "}
              <a href="mailto:support@harvest.finance" className="meth-link">
                support@harvest.finance
              </a>
              . Please include reproduction steps, the affected contract
              address or interface, and a contact channel for follow-up.
            </p>
            <p>
              We aim to acknowledge verified reports within two business
              days. Coordinated disclosure is appreciated where the
              vulnerability could be exploited before a remediation lands.
            </p>
          </section>

          <section id="scope-and-caveats" className="meth-section">
            <h2 className="meth-h2">Scope and caveats</h2>
            <p>
              The audits listed above cover the Harvest smart-contract
              system at the points in time when each engagement was
              conducted. Subsequent contract deployments, vault redesigns,
              and integrations with third-party protocols are not
              automatically in scope. Where a third-party protocol is
              integrated (for example a lending market or AMM that a
              Harvest vault deposits into), the security of that
              third-party protocol is governed by its own audit history,
              not by ours.
            </p>
            <p>
              The full set of risks that can affect a Harvest deposit, and
              the categories we use to communicate them on individual
              product pages, are documented on the{" "}
              <Link href="/risk-framework" className="meth-link">
                risk framework
              </Link>{" "}
              page. The legal disclaimer that accompanies all of this is
              the{" "}
              <Link href="/disclosures" className="meth-link">
                Risk Disclosures
              </Link>{" "}
              statement.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}

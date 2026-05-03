import type { Metadata } from "next";
import Link from "next/link";
import { getLiveVaults, getVaults } from "@/lib/data";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { stripChainSuffix } from "@/lib/format";
import { breadcrumbSchema, articleSchema } from "@/lib/jsonld";
import { METHODOLOGY_VERSION, METHODOLOGY_CHANGELOG, METHODOLOGY_URL } from "@/lib/methodology";

const TITLE = "Methodology: How Harvest Tracks DeFi Yields | Harvest";
const DESCRIPTION =
  "How Harvest tracks 150+ DeFi yield sources. APY calculations, data sources, ranking methodology, and update cadence.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: METHODOLOGY_URL,
    siteName: SITE_NAME,
    type: "article",
  },
  alternates: { canonical: METHODOLOGY_URL },
};

const SECTIONS = [
  { id: "scope", label: "What the index covers" },
  { id: "what-counts", label: "What counts as a yield source" },
  { id: "apy-calculation", label: "APY calculation" },
  { id: "tvl", label: "TVL measurement" },
  { id: "data-freshness", label: "Data freshness" },
  { id: "ranking", label: "Ranking" },
  { id: "consistency", label: "Consistency scoring" },
  { id: "inclusion", label: "Inclusion criteria" },
  { id: "risk-framework", label: "Risk framework" },
  { id: "data-sources", label: "Data sources" },
  { id: "limitations", label: "Limitations" },
  { id: "versioning", label: "Versioning" },
  { id: "disclosure", label: "Disclosure" },
];

const RISK_ITEMS = [
  {
    name: "Smart-contract",
    desc: "A flaw in the vault contract or an integrated protocol contract leads to loss of deposited funds.",
  },
  {
    name: "Oracle",
    desc: "A manipulated or stale price feed leads to incorrect collateral valuation, triggering unintended liquidations or enabling an exploit.",
  },
  {
    name: "Liquidity",
    desc: "A user is unable to withdraw funds from a position at or near the expected value, due to illiquid markets or locked positions.",
  },
  {
    name: "Depeg",
    desc: "For stablecoin and wrapped-asset strategies: the underlying token loses its peg, permanently impairing the value of the deposit.",
  },
  {
    name: "Governance",
    desc: "A protocol's governance mechanism is exploited or manipulated to change contract parameters adversely for depositors.",
  },
];

const LIMITATIONS = [
  {
    title: "Hourly cadence, not real-time",
    desc: "APY and TVL figures reflect the state of the last hourly fetch. Intraday spikes or dips are not captured. Strategies with extremely volatile yields will not be accurately represented by our snapshot-based system.",
  },
  {
    title: "Reward token conversion is upstream",
    desc: "We do not perform our own USD valuation of reward tokens. If the Harvest API's price source for a reward token is stale or inaccurate, the APY reported on this site reflects that inaccuracy.",
  },
  {
    title: "Risk levels are editorial",
    desc: "The low/medium/high classification is not backed by a published quantitative model. It should not be used as the sole basis for assessing the risk of a strategy.",
  },
  {
    title: "Third-party operators not yet indexed",
    desc: "The index currently covers only Harvest-operated strategies. DeFi protocols that deploy similar vault structures (Yearn, Beefy, Convex, etc.) are not represented.",
  },
  {
    title: "No lifetime APY figure",
    desc: "We do not publish a single annualized figure for the full tracked history of a strategy. Share-price growth since inception is shown instead, which is a more honest representation of compounded returns over time.",
  },
  {
    title: "Tracked-since date is not deployment date",
    desc: "The \"live since\" figure reflects when our indexer first observed data for a strategy, not when the vault was deployed on-chain. For strategies deployed before our indexer began tracking them, the figure understates the actual vault age.",
  },
];

function StructuredData({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function MethodologyPage() {
  const [allVaults, liveVaults] = await Promise.all([getVaults(), getLiveVaults()]);

  const chains = new Set(liveVaults.map((v) => v.chain));
  const protocols = new Set(liveVaults.map((v) => stripChainSuffix(v.category, v.chain)));
  const assets = new Set(liveVaults.map((v) => v.asset));

  const crumbs = [
    { name: "Home", url: SITE_URL },
    { name: "Methodology" },
  ];

  const breadcrumb = breadcrumbSchema(crumbs);
  const article = articleSchema({
    title: TITLE,
    description: DESCRIPTION,
    url: METHODOLOGY_URL,
    datePublished: METHODOLOGY_VERSION.date,
    dateModified: METHODOLOGY_VERSION.date,
  });

  const versionDate = new Date(METHODOLOGY_VERSION.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <StructuredData data={breadcrumb} />
      <StructuredData data={article} />

      <main className="methodology-page">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="meth-header">
          <nav className="meth-crumbs mono dim">
            <Link href="/">Home</Link>
            <span>›</span>
            <span>Methodology</span>
          </nav>

          <h1 className="meth-title">Methodology</h1>
          <p className="meth-subtitle">
            How we collect, calculate, and present DeFi yield data.
          </p>
          <p className="meth-version mono dim">
            v{METHODOLOGY_VERSION.version} · Updated {versionDate}
          </p>

          {/* Live coverage stats */}
          <div className="meth-stats" role="list">
            <div className="meth-stat" role="listitem">
              <span className="meth-stat-val">{liveVaults.length}</span>
              <span className="meth-stat-lbl">live strategies</span>
            </div>
            <div className="meth-stat" role="listitem">
              <span className="meth-stat-val">{chains.size}</span>
              <span className="meth-stat-lbl">networks</span>
            </div>
            <div className="meth-stat" role="listitem">
              <span className="meth-stat-val">{assets.size}</span>
              <span className="meth-stat-lbl">asset families</span>
            </div>
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────── */}
        <div className="meth-layout">
          {/* Sticky sidebar TOC */}
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

            {/* ── 1. Scope ──────────────────────────────────── */}
            <section id="scope" className="meth-section">
              <h2 className="meth-h2">What the index covers</h2>
              <p>
                The Harvest yield index currently tracks {allVaults.length} yield strategies
                across {chains.size} networks, covering {assets.size} asset
                families ({Array.from(assets).join(", ")}). Of those,{" "}
                {liveVaults.length} are live at the time of the last data refresh -
                meaning they have both a positive APY and a positive TVL. The remainder are
                inactive or flagged by the operator as deprecated.
              </p>
              <p>
                Coverage reflects what is operated on-chain through Harvest Finance today.
                The intent is to expand the index to include third-party operators under a
                consistent methodology as that infrastructure is built.
              </p>
            </section>

            {/* ── 2. What counts ────────────────────────────── */}
            <section id="what-counts" className="meth-section">
              <h2 className="meth-h2">What counts as a yield source</h2>
              <p>
                The index covers vault-based autocompounding strategies. A vault accepts
                a deposit of a single underlying token, deploys it into one or more
                yield-bearing positions, harvests rewards on an ongoing basis, swaps them
                back into the underlying token, and redeposits. The user holds a share
                token representing a pro-rata claim on the vault.
              </p>
              <p>
                Currently in scope: single-asset lending vaults (Aave, Morpho, Compound,
                and similar), liquidity-provider vaults for constant-function AMMs
                (Aerodrome, Uniswap v3, Curve), and hybrid vaults that layer lending with
                protocol incentives. All strategies denominate in one of the tracked asset
                families: USDC, USDT, ETH (and liquid-staked ETH variants), or BTC (and
                wrapped BTC variants).
              </p>
              <p>
                Not currently indexed: isolated lending markets where the supply token
                differs materially from the withdrawal token, strategies requiring active
                management by the depositor, native protocol staking without a vault
                wrapper, and any strategy without an audited smart contract or verifiable
                on-chain track record.
              </p>
            </section>

            {/* ── 3. APY calculation ────────────────────────── */}
            <section id="apy-calculation" className="meth-section">
              <h2 className="meth-h2">How APY is calculated</h2>
              <p>
                The primary APY figure on hub and product pages is the 24-hour APY: the
                arithmetic mean of all valid APY observations recorded in the last 24 hours.
                A valid observation is one where the recorded value is not negative. If fewer
                than one data point is available in that window, the system falls back to
                the earliest valid APY observation in the history record. APY is expressed
                as an annualized percentage.
              </p>
              <p>
                The 30-day APY is the arithmetic mean of all valid daily APY observations
                from the last 30 days. It is not time-weighted and does not account for
                compounding within the window. Its purpose is to smooth out single-day
                spikes.
              </p>
              <p>
                APY values originate from the Harvest API, which derives them from the
                estimated yield rate of the underlying protocol positions. For strategies
                where reward tokens contribute to yield (such as AERO or CRV emissions),
                those reward streams are included at the rate published by the underlying
                protocol. We do not independently convert reward tokens to USD; the
                conversion is performed upstream by the protocol or its price feed.
              </p>
              <p>
                There is no lifetime APY figure in the index. Annualizing returns over
                multi-year periods conflates compounding periods with different market
                conditions. Lifetime share-price growth is shown instead as a less
                misleading long-term signal.
              </p>
            </section>

            {/* ── 4. TVL ────────────────────────────────────── */}
            <section id="tvl" className="meth-section">
              <h2 className="meth-h2">How TVL is measured</h2>
              <p>
                Total Value Locked (TVL) is the USD value of all assets deposited in a
                given vault. The figure is taken directly from the{" "}
                <code>totalValueLocked</code> field returned by the Harvest API; it is
                not independently recomputed from on-chain reads. The API derives TVL
                from the vault's <code>underlyingBalanceWithInvestment</code> multiplied
                by the underlying token's USD price at the time of the snapshot.
              </p>
              <p>
                TVL shown on hub pages is the sum of individual vault TVL figures within
                that hub's scope. It is not deduplicated. In practice, the strategies
                currently indexed are single-level, so double-counting is not a material
                concern.
              </p>
            </section>

            {/* ── 5. Data freshness ─────────────────────────── */}
            <section id="data-freshness" className="meth-section">
              <h2 className="meth-h2">Data freshness and update cadence</h2>
              <p>
                Strategy data is refetched from the Harvest API once per hour via an
                automated process (cron: <code>0 * * * *</code>). Historical APY, TVL,
                and share-price data is updated each hour for all indexed strategies.
                After each fetch, the site's static HTML is rebuilt and redeployed. A
                visitor may therefore see data that is up to approximately one hour old.
              </p>
              <p>
                There is no real-time streaming of on-chain data. APY and TVL figures will
                not change between rebuilds, even if the underlying on-chain state changes.
              </p>
              <p>
                The "Tracked for X days" figure on each product page is derived from the
                earliest timestamp in the strategy's APY history record - the first time
                our indexer observed a data point for that vault. It is not the vault's
                deployment date.
              </p>
            </section>

            {/* ── 6. Ranking ────────────────────────────────── */}
            <section id="ranking" className="meth-section">
              <h2 className="meth-h2">Ranking methodology</h2>
              <p>
                Strategies are ranked by 24-hour APY in descending order on all hub pages
                (the homepage, asset hubs, and network hubs). This is the default and
                currently the only ranking mode applied when a page loads.
              </p>
              <p>
                There is no risk weighting, no minimum TVL threshold, and no age filter
                built into the default ranking. Users can sort by 30-day APY, TVL, or
                momentum (24-hour APY minus 30-day APY) using the sort controls on each
                hub page. Momentum signals whether a strategy is currently running above
                or below its recent average.
              </p>
              <p>
                Strategies with zero APY or zero TVL are excluded from ranked listings
                entirely, regardless of the API <code>inactive</code> flag.
              </p>
            </section>

            {/* ── 7. Consistency scoring ────────────────────── */}
            <section id="consistency" className="meth-section">
              <h2 className="meth-h2">Volatility and consistency scoring</h2>
              <p>
                Each product page shows an APY Consistency score from 0 to 100. It is
                derived from the coefficient of variation (CV) of the strategy's daily
                APY observations over the last 30 days. CV is the standard deviation
                divided by the mean - a dimensionless measure of relative variability.
              </p>

              <div className="meth-table-wrap">
                <table className="meth-table">
                  <thead>
                    <tr>
                      <th>Label</th>
                      <th>CV threshold</th>
                      <th>Score range</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>Very Consistent</td><td className="mono">CV &lt; 0.10</td><td className="mono">90 - 100</td></tr>
                    <tr><td>Consistent</td><td className="mono">CV &lt; 0.20</td><td className="mono">70 - 89</td></tr>
                    <tr><td>Variable</td><td className="mono">CV &lt; 0.40</td><td className="mono">40 - 69</td></tr>
                    <tr><td>Highly Variable</td><td className="mono">CV &ge; 0.40</td><td className="mono">0 - 39</td></tr>
                  </tbody>
                </table>
              </div>

              <p>
                A separate stability label (very consistent / consistent / moderate /
                volatile) appears in the 30-day APY sub-label on the hero panel. This uses
                raw standard deviation with fixed thresholds (0.5 / 1.5 / 3 percentage
                points). The consistency score is the primary, more nuanced figure.
              </p>
              <p>
                Strategies with fewer than two APY data points in the 30-day window are
                shown with a dash.
              </p>
            </section>

            {/* ── 8. Inclusion ──────────────────────────────── */}
            <section id="inclusion" className="meth-section">
              <h2 className="meth-h2">Inclusion and exclusion criteria</h2>
              <p>
                Inclusion is currently editorial and discretionary. The index covers
                strategies operated by Harvest Finance that pass two automated conditions:
                the operator API must not flag the strategy as <code>inactive</code>,
                and the strategy must have a positive APY and a positive TVL at the time
                of the last fetch. There is no minimum TVL threshold and no minimum age
                requirement.
              </p>
              <p>
                Strategies are excluded when: (a) the operator flags them as inactive,
                (b) their reported APY or TVL is zero or negative at every fetch for an
                extended period, or (c) they do not match any of the tracked asset families.
                Exclusion is automated; no manual review step currently exists.
              </p>
              <p>
                Formal inclusion criteria for third-party operators - minimum audit
                requirements, TVL floors, track-record length - will be published as an
                amendment to this methodology before any third-party strategies are added.
              </p>
            </section>

            {/* ── 9. Risk framework ─────────────────────────── */}
            <section id="risk-framework" className="meth-section">
              <h2 className="meth-h2">Risk framework</h2>
              <p>
                Each strategy carries a risk-level classification (low, medium, or high).
                The five risk dimensions considered are:
              </p>

              <ul className="meth-risk-list">
                {RISK_ITEMS.map((r) => (
                  <li key={r.name} className="meth-risk-item">
                    <span className="meth-risk-name mono">{r.name}</span>
                    <span className="meth-risk-desc">{r.desc}</span>
                  </li>
                ))}
              </ul>

              <p>
                Per-strategy risk levels currently shown on the site are editorial
                classifications, not derived from a quantitative model. All strategies
                in the current index are classified as "low" because they have undergone
                audits and have extended on-chain track records. A more granular,
                evidence-based scoring model is in development.
              </p>
            </section>

            {/* ── 10. Data sources ──────────────────────────── */}
            <section id="data-sources" className="meth-section">
              <h2 className="meth-h2">Data sources</h2>
              <p>
                Strategy metadata - vault addresses, token names, platform names, estimated
                APY, TVL, APY breakdown by source, and reward token information - is sourced
                from the Harvest Finance API at{" "}
                <code>https://api.harvest.finance/vaults</code>. This API is operated by
                Harvest Finance and reflects the state of the protocols as read by their
                backend infrastructure.
              </p>
              <p>
                Historical time-series data (daily APY, TVL, share price) is sourced from
                Harvest's hosted indexer subgraph via GraphQL. Up to 1,000 records are
                returned per series and deduplicated to one observation per calendar day.
              </p>
              <p>
                We do not integrate third-party RPC providers, oracle price feeds, or
                external aggregation services. All data originates from Harvest's own API
                and subgraph. Data accuracy on this site is directly dependent on the
                accuracy of those upstream sources.
              </p>
            </section>

            {/* ── 11. Limitations ───────────────────────────── */}
            <section id="limitations" className="meth-section">
              <h2 className="meth-h2">Limitations and known gaps</h2>

              <ul className="meth-limit-list">
                {LIMITATIONS.map((l, i) => (
                  <li key={i} className="meth-limit-item">
                    <span className="meth-limit-num mono">{String(i + 1).padStart(2, "0")}</span>
                    <span className="meth-limit-body">
                      <b className="meth-limit-title">{l.title}</b>
                      <span className="meth-limit-desc">{l.desc}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* ── 12. Versioning ────────────────────────────── */}
            <section id="versioning" className="meth-section">
              <h2 className="meth-h2">Methodology versioning</h2>
              <p>
                This methodology is versioned. Each meaningful change to how data is
                collected, calculated, or presented will be logged here. Hourly data
                refreshes are not methodology changes and are not logged.
              </p>

              <div className="meth-table-wrap">
                <table className="meth-table">
                  <thead>
                    <tr>
                      <th>Version</th>
                      <th>Date</th>
                      <th>Summary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {METHODOLOGY_CHANGELOG.map((entry) => (
                      <tr key={entry.version}>
                        <td className="mono">{entry.version}</td>
                        <td className="mono">{entry.date}</td>
                        <td>{entry.summary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── 13. Disclosure ────────────────────────────── */}
            <section id="disclosure" className="meth-section">
              <h2 className="meth-h2">Disclosure</h2>

              <div className="meth-disclosure">
                <p>
                  Harvest Finance operates every strategy currently listed in this index.
                  The index is not, at this stage, a neutral aggregator of third-party
                  protocols - it is an index of Harvest's own products. We state this
                  explicitly because the site's positioning as an "independent yield index"
                  reflects an intended future state, not the current one. Readers and
                  journalists should interpret ranked listings as rankings within the
                  Harvest product catalog, not across DeFi at large.
                </p>
                <p>
                  Listing position and ranking are determined solely by APY (or the sort
                  order selected by the user). Operator status does not influence ranking
                  because, at present, all listed strategies share the same operator.
                  When third-party strategies are added, the same APY-first ranking
                  methodology will apply equally to all operators.
                </p>
                <p>
                  This site does not currently generate referral or affiliate revenue from
                  any strategy listing. If referral links or affiliate arrangements are
                  introduced in the future, they will be disclosed inline on the relevant
                  strategy pages and in this section.
                </p>
              </div>
            </section>

          </article>
        </div>
      </main>
    </>
  );
}

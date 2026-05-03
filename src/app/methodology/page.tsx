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
  { id: "apy-calculation", label: "How APY is calculated" },
  { id: "tvl", label: "How TVL is measured" },
  { id: "data-freshness", label: "Data freshness and update cadence" },
  { id: "ranking", label: "Ranking methodology" },
  { id: "consistency", label: "Volatility and consistency scoring" },
  { id: "inclusion", label: "Inclusion and exclusion criteria" },
  { id: "risk-framework", label: "Risk framework" },
  { id: "data-sources", label: "Data sources" },
  { id: "limitations", label: "Limitations and known gaps" },
  { id: "versioning", label: "Methodology versioning" },
  { id: "disclosure", label: "Disclosure" },
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

  return (
    <>
      <StructuredData data={breadcrumb} />
      <StructuredData data={article} />

      <main className="page methodology-page">
        <div className="meth-header">
          <nav className="meth-crumbs mono dim">
            <Link href="/">Home</Link>
            <span> › </span>
            <span>Methodology</span>
          </nav>
          <h1>Methodology</h1>
          <p className="meth-meta mono dim">
            Version {METHODOLOGY_VERSION.version} · Last updated{" "}
            {new Date(METHODOLOGY_VERSION.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="meth-layout">
          <aside className="meth-toc">
            <div className="meth-toc-label mono dim">On this page</div>
            <ol className="meth-toc-list">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="meth-toc-link">
                    {s.label}
                  </a>
                </li>
              ))}
            </ol>
          </aside>

          <article className="meth-body">

            <section id="scope">
              <h2>What the index covers</h2>
              <p>
                The Harvest yield index currently tracks {allVaults.length} yield strategies
                across {chains.size} networks and {protocols.size} DeFi protocols, covering{" "}
                {assets.size} asset families ({Array.from(assets).join(", ")}). Of those,{" "}
                {liveVaults.length} strategies are live at the time of the last data refresh -
                meaning they have both a positive APY and a positive TVL. The remainder are
                inactive or have been flagged by the operator as deprecated.
              </p>
              <p>
                Coverage reflects what is operated on-chain through Harvest Finance today.
                The intent is to expand the index to include third-party operators under a
                consistent methodology as that infrastructure is built. When expansion happens,
                this section will update with revised counts and coverage scope.
              </p>
            </section>

            <section id="what-counts">
              <h2>What counts as a yield source</h2>
              <p>
                The index covers vault-based autocompounding strategies. A vault, in this
                context, is a smart contract that accepts a deposit of a single underlying
                token, deploys it into one or more yield-bearing positions, harvests rewards
                on an ongoing basis, swaps them back into the underlying token, and redeposits.
                The user holds a share token representing a pro-rata claim on the vault.
              </p>
              <p>
                The following are currently in scope: single-asset lending vaults (Aave,
                Morpho, Compound, and similar), liquidity-provider vaults for constant-function
                AMMs (Aerodrome, Uniswap v3, Curve), and hybrid vaults that layer lending
                with protocol incentives. All strategies denominate in one of the tracked
                asset families: USDC, USDT, ETH (and liquid-staked ETH variants), or BTC
                (and wrapped BTC variants).
              </p>
              <p>
                The following are not currently indexed: isolated lending markets where the
                supply token differs materially from the withdrawal token, strategies that
                require active management by the depositor, native protocol staking (e.g.
                ETH staking via Lido directly without a vault wrapper), and any strategy
                without an audited smart contract or without a verifiable on-chain track record.
              </p>
            </section>

            <section id="apy-calculation">
              <h2>How APY is calculated</h2>
              <p>
                The primary APY figure displayed on hub and product pages is the 24-hour APY.
                It is the arithmetic mean of all valid APY observations recorded in the last
                24 hours from our indexer. A valid observation is one where the recorded value
                is not negative. If fewer than one data point is available within that window,
                the system falls back to the earliest valid APY observation in the history
                record. APY is expressed as an annualized percentage.
              </p>
              <p>
                The 30-day APY is the arithmetic mean of all valid daily APY observations
                from the last 30 days. It is not time-weighted and does not account for
                compounding within the window. Its purpose is to smooth out single-day
                spikes and give a longer-horizon view of a strategy's yield level.
              </p>
              <p>
                APY values originate from the Harvest API, which derives them from the
                estimated yield rate of the underlying protocol positions. For strategies
                where reward tokens contribute to yield (such as AERO or CRV emissions),
                those reward streams are included in the reported APY at the rate published
                by the underlying protocol. We do not independently convert reward tokens
                to USD; the conversion is performed upstream by the protocol or its price
                feed. Reward token APY components are shown separately in the APY breakdown
                panel on each product page.
              </p>
              <p>
                There is no lifetime APY figure in the index. Annualizing returns over
                multi-year periods conflates compounding periods with different market
                conditions and different strategy parameters. Lifetime share-price growth
                is shown instead (see Share Price below) as a less misleading long-term
                signal.
              </p>
            </section>

            <section id="tvl">
              <h2>How TVL is measured</h2>
              <p>
                Total Value Locked (TVL) is the USD value of all assets currently deposited
                in a given vault. The figure is taken directly from the{" "}
                <code>totalValueLocked</code> field returned by the Harvest API; it is not
                independently recomputed from on-chain reads. The Harvest API derives TVL
                from the vault's <code>underlyingBalanceWithInvestment</code> multiplied by
                the underlying token's USD price at the time of the data snapshot.
              </p>
              <p>
                TVL shown on hub pages is the sum of individual vault TVL figures within
                that hub's scope. It is not deduplicated: if the same capital passes through
                multiple vaults in a chain (e.g., a vault depositing into another vault),
                it would be counted more than once. In practice, the strategies currently
                indexed are single-level, so double-counting is not a material concern at
                this time.
              </p>
            </section>

            <section id="data-freshness">
              <h2>Data freshness and update cadence</h2>
              <p>
                Strategy data is refetched from the Harvest API once per hour via an
                automated process (GitHub Actions cron schedule: <code>0 * * * *</code>).
                Historical APY, TVL, and share-price data is also updated each hour for
                all indexed strategies. After each fetch, the site's static HTML is
                rebuilt and redeployed. A visitor may therefore see data that is up to
                approximately one hour old.
              </p>
              <p>
                There is no real-time streaming of on-chain data. The index is a
                snapshot-based system: data accuracy reflects the state of the underlying
                protocols at the time of the last hourly fetch. APY and TVL figures shown
                on the site will not change between rebuilds, even if the underlying
                on-chain state changes.
              </p>
              <p>
                The "Tracked for X days" figure on each product page is derived from the
                earliest timestamp in the strategy's APY history record - the first time
                our indexer observed a data point for that vault. It is not the vault's
                deployment date (that metadata is not reliably available from the API).
              </p>
            </section>

            <section id="ranking">
              <h2>Ranking methodology</h2>
              <p>
                Strategies are ranked by 24-hour APY in descending order on all hub pages
                (the homepage, asset hubs, and network hubs). This is the default and
                currently the only ranking mode applied when a page loads.
              </p>
              <p>
                There is no risk weighting, no minimum TVL threshold, and no age filter
                built into the default ranking. A newly indexed vault with a high reported
                APY will rank above a long-established vault with a lower APY. Users can
                sort by 30-day APY, TVL, or momentum (24-hour APY minus 30-day APY) using
                the sort controls on each hub page. Momentum is useful as a signal of
                whether a strategy is currently running above or below its recent average.
              </p>
              <p>
                Strategies with zero APY or zero TVL are excluded from ranked listings
                entirely. They are treated as inactive regardless of the API{" "}
                <code>inactive</code> flag.
              </p>
            </section>

            <section id="consistency">
              <h2>Volatility and consistency scoring</h2>
              <p>
                Each product page shows an APY Consistency score, a number from 0 to 100.
                It is derived from the coefficient of variation (CV) of the strategy's
                daily APY observations over the last 30 days. The coefficient of variation
                is the standard deviation divided by the mean: a dimensionless measure of
                relative variability.
              </p>

              <table className="meth-table">
                <thead>
                  <tr>
                    <th>Label</th>
                    <th>CV threshold</th>
                    <th>Score range</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Very Consistent</td><td>CV &lt; 0.10</td><td>90 - 100</td></tr>
                  <tr><td>Consistent</td><td>CV &lt; 0.20</td><td>70 - 89</td></tr>
                  <tr><td>Variable</td><td>CV &lt; 0.40</td><td>40 - 69</td></tr>
                  <tr><td>Highly Variable</td><td>CV &ge; 0.40</td><td>0 - 39</td></tr>
                </tbody>
              </table>

              <p>
                A strategy where APY bounces between 2% and 40% in a 30-day window will
                have a high CV and therefore a low consistency score. A strategy with a
                stable lending rate will have a low CV and a high score.
              </p>
              <p>
                A separate stability label (very consistent / consistent / moderate /
                volatile) appears in the 30-day APY sub-label on the hero panel. This
                label is derived from the raw standard deviation of 30-day APY observations
                alone (not CV), using fixed thresholds: below 0.5 percentage points is
                "very consistent," below 1.5 is "consistent," below 3 is "moderate,"
                and 3 or above is "volatile." The two signals overlap in meaning but
                use different statistics; the consistency score is the primary, more
                nuanced figure.
              </p>
              <p>
                Strategies with fewer than two APY data points in the 30-day window do
                not receive a meaningful consistency score and are shown with a dash.
              </p>
            </section>

            <section id="inclusion">
              <h2>Inclusion and exclusion criteria</h2>
              <p>
                Inclusion is currently editorial and discretionary. The index covers
                strategies operated by Harvest Finance that pass two automated conditions:
                the operator API must not flag the strategy as <code>inactive</code>,
                and the strategy must have a positive APY and a positive TVL at the time
                of the last fetch. There is no minimum TVL threshold and no minimum age
                requirement. A newly deployed vault with $100 TVL and a positive APY will
                appear in the index.
              </p>
              <p>
                Strategies are excluded when: (a) the operator flags them as inactive, (b)
                their reported APY or TVL is zero or negative at every fetch for an extended
                period, or (c) they do not match any of the tracked asset families (USDC,
                USDT, ETH family, BTC family). Exclusion is automated; no manual review
                step currently exists.
              </p>
              <p>
                Formal inclusion criteria for third-party operators - minimum audit
                requirements, TVL floors, track-record length - are in development and will
                be published as an amendment to this methodology before any third-party
                strategies are added.
              </p>
            </section>

            <section id="risk-framework">
              <h2>Risk framework</h2>
              <p>
                Each strategy carries a risk-level classification (low, medium, or high).
                The categories used are:
              </p>
              <p>
                <b>Smart-contract risk</b> - the probability that a flaw in the vault
                contract or an integrated protocol contract leads to loss of deposited funds.
              </p>
              <p>
                <b>Oracle risk</b> - the probability that a manipulated or stale price feed
                leads to incorrect collateral valuation, triggering unintended liquidations
                or enabling an exploit.
              </p>
              <p>
                <b>Liquidity risk</b> - the probability that a user is unable to withdraw
                funds from a position at or near the expected value, due to illiquid markets
                or locked positions.
              </p>
              <p>
                <b>Depeg risk</b> - for stablecoin and wrapped-asset strategies, the
                probability that the underlying token loses its peg, permanently impairing
                the value of the deposit.
              </p>
              <p>
                <b>Governance risk</b> - the probability that a protocol's governance
                mechanism is exploited or manipulated to change contract parameters
                adversely for depositors.
              </p>
              <p>
                Per-strategy risk levels currently shown on the site are editorial
                classifications. They are not yet derived from a quantitative model.
                All strategies in the current index are classified as "low" because they
                have undergone audits and have extended on-chain track records through
                Harvest Finance. A more granular, evidence-based scoring model is being
                developed and will be published in a dedicated{" "}
                <Link href="/methodology#risk-framework">/risk-framework</Link> page
                (forthcoming) with its own versioning.
              </p>
            </section>

            <section id="data-sources">
              <h2>Data sources</h2>
              <p>
                Strategy metadata - vault addresses, token names, platform names, estimated
                APY, TVL, APY breakdown by source, and reward token information - is sourced
                from the Harvest Finance API endpoint at{" "}
                <code>https://api.harvest.finance/vaults</code>. This API is operated by
                Harvest Finance and reflects the state of the protocols as read by Harvest's
                backend infrastructure.
              </p>
              <p>
                Historical time-series data - daily APY, daily TVL, and daily share price -
                is sourced from Harvest's hosted indexer subgraph. The subgraph is queried
                via GraphQL per vault address and returns up to 1,000 records per series.
                Data is deduplicated to one observation per calendar day (last value of day).
              </p>
              <p>
                We do not currently integrate third-party RPC providers, oracle price feeds
                (such as Chainlink or Pyth), or external aggregation services (such as
                DeFiLlama or Coingecko). All data originates from and passes through
                Harvest's own API and subgraph. This means the accuracy of data on this
                site is directly dependent on the accuracy of those upstream sources.
              </p>
            </section>

            <section id="limitations">
              <h2>Limitations and known gaps</h2>
              <p>
                <b>Hourly cadence, not real-time.</b> APY and TVL figures reflect the state
                of the last hourly fetch. Intraday spikes or dips are not captured.
                Strategies with extremely volatile yields (such as LP pools receiving
                short-lived incentive bursts) will not be accurately represented by our
                snapshot-based system.
              </p>
              <p>
                <b>Reward token USD conversion is upstream.</b> We do not perform our own
                USD valuation of reward tokens. If the Harvest API's price source for a
                reward token is stale or inaccurate, the APY reported on this site will
                reflect that inaccuracy.
              </p>
              <p>
                <b>Risk levels are editorial.</b> The low/medium/high classification is
                not backed by a published quantitative model. It should not be used as
                the sole basis for assessing the risk of a strategy.
              </p>
              <p>
                <b>Third-party operators are not yet indexed.</b> The index currently
                covers only Harvest-operated strategies. DeFi protocols that deploy similar
                vault structures (Yearn, Beefy, Convex, etc.) are not represented.
              </p>
              <p>
                <b>No lifetime APY.</b> We do not publish a single annualized figure for
                the full tracked history of a strategy. Share-price growth since inception
                is shown instead, which is a more honest representation of compounded
                returns over time.
              </p>
              <p>
                <b>Tracked-since date is not deployment date.</b> The "live since" figure
                reflects when our indexer first observed data for a strategy, not when the
                vault was deployed on-chain. For strategies deployed before our indexer
                began tracking them, the figure understates the actual vault age.
              </p>
            </section>

            <section id="versioning">
              <h2>Methodology versioning</h2>
              <p>
                This methodology is versioned. Each meaningful change to how data is
                collected, calculated, or presented will be logged here with a version
                number, date, and plain-language description of what changed and why.
                Data refreshes - hourly fetches that update APY and TVL figures - do not
                constitute a methodology change and are not logged here.
              </p>
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
                      <td>{entry.version}</td>
                      <td>{entry.date}</td>
                      <td>{entry.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section id="disclosure">
              <h2>Disclosure</h2>
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
            </section>

          </article>
        </div>
      </main>
    </>
  );
}

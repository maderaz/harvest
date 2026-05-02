import { YieldVault } from "@/lib/types";
import { formatAPY, formatTVL } from "@/lib/format";

interface Props {
  vault: YieldVault;
  allVaults: YieldVault[];
}

export function MarketBenchmark({ vault, allVaults }: Props) {
  const sameAsset = allVaults
    .filter((v) => v.asset === vault.asset && v.apy24h > 0)
    .sort((a, b) => b.apy24h - a.apy24h);

  if (sameAsset.length < 2) return null;

  const rank = sameAsset.findIndex((v) => v.id === vault.id) + 1;
  const avgApy = sameAsset.reduce((s, v) => s + v.apy24h, 0) / sameAsset.length;
  const vsAvg = avgApy > 0 ? ((vault.apy24h - avgApy) / avgApy) * 100 : 0;

  const top6 = sameAsset.slice(0, 6);
  const currentInTop = top6.some((v) => v.id === vault.id);
  if (!currentInTop && rank > 0) {
    top6[top6.length - 1] = vault;
  }

  return (
    <section className="pp-section" id="benchmark">
      <h2>Market benchmarking</h2>
      <p>
        Within the tracked {vault.asset} ecosystem, this product ranks <strong>#{rank} of {sameAsset.length}</strong> strategies.
        Its {formatAPY(vault.apy24h)} yield is{" "}
        <strong>{Math.abs(vsAvg).toFixed(1)}% {vsAvg >= 0 ? "higher" : "lower"}</strong> than
        the tracked market average of {formatAPY(avgApy)}.
      </p>

      <div className="bench-stats">
        <div><div className="bs-l">Asset average APY</div><div className="bs-v mono">{formatAPY(avgApy)}</div></div>
        <div><div className="bs-l">This product APY</div><div className="bs-v mono up">{formatAPY(vault.apy24h)}</div></div>
        <div><div className="bs-l">Market rank</div><div className="bs-v mono">#{rank} / {sameAsset.length}</div></div>
        <div><div className="bs-l">vs. Average</div><div className="bs-v mono up">{vsAvg >= 0 ? "+" : ""}{vsAvg.toFixed(1)}%</div></div>
      </div>

      <div className="bench-table">
        <div className="bt-head">
          <span>#</span><span>Product</span><span>Chain</span><span className="r">APY</span><span className="r">TVL</span>
        </div>
        {top6.map((v, i) => {
          const isYou = v.id === vault.id;
          const displayRank = sameAsset.findIndex((s) => s.id === v.id) + 1;
          return (
            <div key={v.id} className={`bt-row${isYou ? " you" : ""}`}>
              <span className="mono dim">#{displayRank}</span>
              <span>
                <strong>{v.productName}</strong>
                {isYou && <span className="here-pill">You are here</span>}
              </span>
              <span><span className="chip">{v.chain}</span></span>
              <span className="r mono"><strong className="up">{formatAPY(v.apy24h)}</strong></span>
              <span className="r mono">{formatTVL(v.tvl)}</span>
            </div>
          );
        })}
        <div className="bt-row avg">
          <span></span>
          <span className="dim">Tracked {vault.asset} market average</span>
          <span></span>
          <span className="r mono dim">{formatAPY(avgApy)}</span>
          <span></span>
        </div>
      </div>

      <ClosingBenchmark vault={vault} sameAsset={sameAsset} rank={rank} />
    </section>
  );
}

function ClosingBenchmark({
  vault,
  sameAsset,
  rank,
}: {
  vault: YieldVault;
  sameAsset: YieldVault[];
  rank: number;
}) {
  const outperformPct = Math.round(
    ((sameAsset.length - rank) / sameAsset.length) * 100,
  );

  const tvlSorted = [...sameAsset].sort((a, b) => b.tvl - a.tvl);
  const tvlRank = tvlSorted.findIndex((v) => v.id === vault.id) + 1;
  const topTvl = tvlSorted[0];
  const tvlComparison =
    topTvl && topTvl.id !== vault.id && topTvl.tvl > vault.tvl * 2
      ? ` However, with ${formatTVL(vault.tvl)} TVL it holds significantly less capital than ${topTvl.productName} (${formatTVL(topTvl.tvl)}).`
      : tvlRank <= 3
        ? ` By TVL it ranks #${tvlRank}, making it one of the most established tracked ${vault.asset} vaults.`
        : "";

  return (
    <p style={{ marginTop: 14 }}>
      {vault.productName} currently ranks #{rank} among{" "}
      {sameAsset.length} tracked {vault.asset} strategies, outperforming{" "}
      {outperformPct}% of tracked {vault.asset} opportunities.
      {tvlComparison}
    </p>
  );
}

export function EcosystemContext({ vault, allVaults }: Props) {
  const sameChain = allVaults
    .filter((v) => v.asset === vault.asset && v.chain === vault.chain && v.apy24h > 0)
    .sort((a, b) => b.apy24h - a.apy24h);

  if (sameChain.length < 2) return null;

  const networkAvg = sameChain.reduce((s, v) => s + v.apy24h, 0) / sameChain.length;
  const rank = sameChain.findIndex((v) => v.id === vault.id) + 1;
  const maxApy = sameChain[0]?.apy24h || 1;
  const vsNetAvg = networkAvg > 0 ? ((vault.apy24h - networkAvg) / networkAvg) * 100 : 0;

  const top6 = sameChain.slice(0, 6);
  const currentInTop = top6.some((v) => v.id === vault.id);
  if (!currentInTop && rank > 0) {
    top6[top6.length - 1] = vault;
  }

  return (
    <section className="pp-section" id="ecosystem">
      <h2>Ecosystem context</h2>
      <p>
        Positioned within the tracked {vault.chain} ecosystem, this product{"'"}s yield is{" "}
        <strong>{Math.abs(vsNetAvg).toFixed(1)}% {vsNetAvg >= 0 ? "higher" : "lower"}</strong> than
        the tracked network average for {vault.asset} strategies. By APY it ranks{" "}
        <strong>#{rank} of {sameChain.length}</strong> tracked {vault.asset} strategies on {vault.chain}.
      </p>

      <div className="eco-rank-head">
        <span>{vault.asset} on {vault.chain}</span>
        <span className="mono dim">#{rank} of {sameChain.length} by APY</span>
      </div>
      <div className="eco-rank">
        {top6.map((v) => {
          const isYou = v.id === vault.id;
          const displayRank = sameChain.findIndex((s) => s.id === v.id) + 1;
          return (
            <div key={v.id} className={`eco-row${isYou ? " you" : ""}`}>
              <span className="er-rank mono dim">#{displayRank}</span>
              <span className="er-name">
                {v.productName}
                {isYou && <span className="here-pill">You are here</span>}
              </span>
              <span className="er-bar">
                <span style={{ width: `${(v.apy24h / maxApy) * 100}%` }} />
              </span>
              <span className="er-apy mono">{formatAPY(v.apy24h)}</span>
            </div>
          );
        })}
        <div className="eco-row baseline">
          <span></span>
          <span className="dim">Tracked network average</span>
          <span className="er-bar">
            <span style={{ width: `${(networkAvg / maxApy) * 100}%`, background: "var(--ink-4)" }} />
          </span>
          <span className="er-apy mono dim">{formatAPY(networkAvg)}</span>
        </div>
      </div>

      <ClosingEcosystem vault={vault} sameChain={sameChain} rank={rank} />
    </section>
  );
}

function ClosingEcosystem({
  vault,
  sameChain,
  rank,
}: {
  vault: YieldVault;
  sameChain: YieldVault[];
  rank: number;
}) {
  const tvlSorted = [...sameChain].sort((a, b) => b.tvl - a.tvl);
  const tvlRank = tvlSorted.findIndex((v) => v.id === vault.id) + 1;

  const isTop = rank === 1;
  const topLabel = isTop
    ? `Currently the highest-yielding tracked ${vault.asset} opportunity on ${vault.chain} among ${sameChain.length} tracked products.`
    : `By TVL, this product ranks #${tvlRank} of ${sameChain.length} tracked ${vault.asset} strategies on ${vault.chain}.`;

  return (
    <p style={{ marginTop: 14 }}>
      {topLabel} This strategy is operated by {vault.protocol.name} and
      competes against {sameChain.length - 1} other tracked {vault.asset} strategies
      on the {vault.chain} network.
    </p>
  );
}

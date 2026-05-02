# Project conventions

## Content style

- **Never use the long em dash (`—`, U+2014) anywhere in user-facing content.** This applies to everything visible in the product: page titles, subtitles, headings, body copy, hero text, narrative blocks, table cells, button labels, tooltips, FAQ answers, and meta descriptions. Use a comma, period, colon, or " - " (hyphen with spaces) instead.
- The rule is content-only. The em dash is fine in code comments, commit messages, and PR descriptions.

## Coverage claims and overstatement

We do not list every yield source in DeFi, only the ones we actively index. Any user-facing sentence that compares this product to a population (rankings, market averages, "the ecosystem", "the network", outperformance percentages, "X of Y strategies", etc.) must signal that the population is **what we track**, not the entire market. Concretely:

- Use phrases like "tracked", "tracked X ecosystem", "tracked market average", "tracked network average", "of N tracked strategies", "tracked products", "monitored". Never write "the USDC ecosystem", "the market average", "the network average", or "all USDC vaults" without that qualifier.
- This applies to: ranking sentences ("ranks #N of N"), comparison sentences ("X% higher than the average"), ecosystem/network framing, outperformance claims, and "highest-yielding" / "most established" superlatives.
- It does not apply to general SEO/meta copy that markets the site itself ("Best DeFi yields", "Compare strategies"), nor to factual single-vault statements (current APY, TVL, share price, days tracked).
- The goal is unfalsifiability: if someone produces a vault we don't index, our copy must still read as accurate.

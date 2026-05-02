# Project conventions

## Content style

- **Never use the long em dash (`—`, U+2014) anywhere in user-facing content.** This applies to everything visible in the product: page titles, subtitles, headings, body copy, hero text, narrative blocks, table cells, button labels, tooltips, FAQ answers, and meta descriptions. Use a comma, period, colon, or " - " (hyphen with spaces) instead.
- The rule is content-only. The em dash is fine in code comments, commit messages, and PR descriptions.

## Coverage claims and overstatement

We do not list every yield source in DeFi, only the ones we actively index. Any user-facing sentence that compares this product to a population (rankings, market averages, "the ecosystem", "the network", outperformance percentages, "X of Y strategies", etc.) must signal that the population is **what we track**, not the entire market. Concretely:

- Signal scope **once per section**, not in every sentence. Once a paragraph has established that the comparison is against "the {N} {asset} strategies we monitor", subsequent sentences can refer to "the cohort", "that set", "them", "the network average", etc. without re-qualifying.
- Vary the phrasing. Good options: "we monitor", "we follow", "we currently track", "in our index", "the strategies we monitor", "across the products we follow", "the cohort", "in that set". Avoid stacking "tracked tracked tracked" across one paragraph.
- Always include at least one signal somewhere in each comparison section, so a reader who lands on that section alone understands the population.
- This applies to: ranking sentences ("ranks #N of N"), comparison sentences ("X% higher than the average"), ecosystem/network framing, outperformance claims, and "highest-yielding" / "most established" superlatives.
- Labels, table headers, pills, tile captions, and tags (one-to-three-word UI strings) are exempt; they can use "tracked" as a short qualifier without softening, and don't count toward the "once per section" budget.
- It does not apply to general SEO/meta copy that markets the site itself ("Best DeFi yields", "Compare strategies"), nor to factual single-vault statements (current APY, TVL, share price, days tracked).
- The goal is unfalsifiability: if someone produces a vault we don't index, our copy must still read as accurate.

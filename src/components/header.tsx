import Link from "next/link";
import { getVaults } from "@/lib/data";
import { SearchBox, type SearchItem } from "./search-box";

export async function Header() {
  const navItems = [
    { label: "USDC", href: "/USDC" },
    { label: "USDT", href: "/USDT" },
    { label: "ETH", href: "/ETH" },
    { label: "BTC", href: "/BTC" },
  ];

  const vaults = await getVaults();
  const items: SearchItem[] = vaults.map((v) => ({
    slug: v.slug,
    productName: v.productName,
    asset: v.asset,
    chain: v.chain,
    protocol: v.protocol.name,
    category: v.category,
    apy24h: v.apy24h,
    tvl: v.tvl,
  }));

  return (
    <header className="topnav">
      <div className="topnav-inner">
        <Link href="/" className="brand">
          <span className="brand-name">Harvest</span>
        </Link>
        <nav className="navlinks">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="nav-right">
          <SearchBox items={items} />
        </div>
      </div>
    </header>
  );
}

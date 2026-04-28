import Link from "next/link";

export function Header() {
  const navItems = [
    { label: "USDC", href: "/USDC" },
    { label: "USDT", href: "/USDT" },
    { label: "ETH", href: "/ETH" },
    { label: "BTC", href: "/BTC" },
  ];

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
          <label className="search-box">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
            </svg>
            <input placeholder="Search pool, protocol, asset..." readOnly />
            <kbd>&#8984;K</kbd>
          </label>
        </div>
      </div>
    </header>
  );
}

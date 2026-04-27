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
          <div className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 20 20" width="20" height="20">
              <rect x="1" y="11" width="3" height="7" fill="currentColor" />
              <rect x="6" y="7" width="3" height="11" fill="currentColor" />
              <rect x="11" y="3" width="3" height="15" fill="currentColor" />
              <rect x="16" y="8" width="3" height="10" fill="currentColor" opacity="0.5" />
            </svg>
          </div>
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

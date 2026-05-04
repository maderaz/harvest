"use client";

import { useEffect, useState } from "react";

interface Props {
  contractLabel: string;
}

const TABS: { id: string; long: string; short?: string }[] = [
  { id: "about", long: "Overview" },
  { id: "performance", long: "Performance" },
  { id: "benchmark", long: "Benchmarks" },
  { id: "history", long: "History" },
  { id: "faq", long: "FAQ" },
  { id: "details", long: "Contract details", short: "Details" },
];

export function VaultTabs({ contractLabel }: Props) {
  const [activeId, setActiveId] = useState<string>("about");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const sections = TABS
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    // The tab strip pins right under the topnav at y=52px and is ~44px
    // tall, so we treat anything within that band as the active section.
    const STICKY_OFFSET = 120;

    function update() {
      const scrollY = window.scrollY;
      let current = sections[0].id;
      for (const sec of sections) {
        const top = sec.getBoundingClientRect().top + scrollY - STICKY_OFFSET;
        if (scrollY >= top - 4) {
          current = sec.id;
        } else {
          break;
        }
      }
      setActiveId(current);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <nav className="vh-tabs">
      <div className="vh-tabs-inner">
        {TABS.map((t) => (
          <a
            key={t.id}
            href={`#${t.id}`}
            className={`vh-tab${activeId === t.id ? " active" : ""}`}
          >
            {t.short ? (
              <>
                <span className="vh-tab-long">{t.long}</span>
                <span className="vh-tab-short">{t.short}</span>
              </>
            ) : (
              t.long
            )}
          </a>
        ))}
        <span className="vh-tabs-spacer" />
        <span className="vh-tabs-meta mono">{contractLabel}</span>
      </div>
    </nav>
  );
}

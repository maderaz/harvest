"use client";

import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

interface VaultFaqProps {
  productName: string;
  protocolName: string;
  asset: string;
  chain: string;
  vaultType: string;
  apy24h: string;
  tvl: string;
  riskLevel: string;
  description: string;
  faqItems: FaqItem[];
}

function FaqAccordionItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        type="button"
        className="flex w-full items-center justify-between py-4 text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-gray-900">
          {item.question}
        </span>
        <span className="ml-4 flex-shrink-0 text-gray-400" aria-hidden="true">
          {open ? (
            <svg
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </span>
      </button>
      {open && (
        <div className="pb-4">
          <p className="text-sm leading-relaxed text-gray-600">{item.answer}</p>
        </div>
      )}
    </div>
  );
}

export function VaultFaq({ faqItems }: VaultFaqProps) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">
        Frequently Asked Questions
      </h2>
      <div className="rounded-lg border border-gray-200 bg-white px-5">
        {faqItems.map((item, i) => (
          <FaqAccordionItem key={i} item={item} />
        ))}
      </div>
    </section>
  );
}

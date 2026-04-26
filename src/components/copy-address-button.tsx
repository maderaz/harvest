"use client";

import { useState } from "react";

interface CopyAddressButtonProps {
  address: string;
  compact?: boolean;
}

export function CopyAddressButton({ address, compact }: CopyAddressButtonProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (compact) {
    return (
      <button
        className="cd-copy-btn"
        onClick={handleCopy}
        type="button"
        aria-label={copied ? "Copied" : "Copy address"}
        title={copied ? "Copied!" : "Copy address"}
      >
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
    );
  }

  return (
    <button className="pp-copy-btn" onClick={handleCopy} type="button">
      {copied ? "Copied!" : "Copy address"}
    </button>
  );
}

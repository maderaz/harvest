"use client";

import { useState } from "react";

interface CopyAddressButtonProps {
  address: string;
}

export function CopyAddressButton({ address }: CopyAddressButtonProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button className="pp-copy-btn" onClick={handleCopy} type="button">
      {copied ? "Copied!" : "Copy address"}
    </button>
  );
}

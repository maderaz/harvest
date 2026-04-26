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

export function VaultFaq({ faqItems }: VaultFaqProps) {
  return (
    <div className="pp-section" id="faq">
      <h2>Frequently Asked Questions</h2>
      <div className="faq">
        {faqItems.map((item, i) => (
          <details key={i} open={i === 0}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

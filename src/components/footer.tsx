export function Footer() {
  return (
    <footer className="foot">
      <div className="foot-inner">
        <div>
          <span className="brand-name">Harvest</span>
          <span className="mono dim"> &middot; Independent onchain yield index</span>
        </div>
        <div className="foot-links mono">
          <a href="#">API</a>
          <a href="#">Methodology</a>
          <a href="#">Risk framework</a>
          <a href="#">Docs</a>
          <a href="#">Status</a>
          <a href="#">Terms</a>
        </div>
        <div className="mono dim">&copy; 2026 &middot; Data delayed &le; 60s</div>
      </div>
    </footer>
  );
}

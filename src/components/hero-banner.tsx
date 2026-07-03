/**
 * HeroBanner — Wedding photo hero section with gradient overlay and logo.
 * Displays at the top of the guest search page.
 */
export default function HeroBanner() {
  return (
    <section className="hero">
      {/* Placeholder gradient background — replace with actual couple's photo */}
      <div
        className="hero__image"
        style={{
          background:
            "linear-gradient(135deg, #f5ebe0 0%, #d5c4a1 30%, #e8d5b0 60%, #f0e6d3 100%)",
        }}
        role="img"
        aria-label="Wedding banner"
      />
      <div className="hero__overlay" />
      <div className="hero__logo">
        <span className="hero__logo-text">JB</span>
      </div>
    </section>
  );
}

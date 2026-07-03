import Image from "next/image";

/**
 * HeroBanner — Monogram logo that sits between the bg photo and content.
 * The bg.jpg is used as the full page background (set in page-container),
 * so this component only renders the centered monogram logo.
 */
export default function HeroBanner() {
  return (
    <div className="hero__logo">
      <Image
        src="/images/logo.png"
        alt="JB Monogram"
        width={90}
        height={110}
        priority
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}

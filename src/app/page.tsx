import Image from "next/image";
import HeroBanner from "@/components/hero-banner";
import SearchBar from "@/components/search-bar";

/**
 * Home Page — Guest-facing wedding seating search.
 * Uses bg.jpg as the full page background via Next.js Image with fill.
 */
export default function HomePage() {
  return (
    <main className="page-container">
      {/* Full-page background image */}
      <Image
        src="/images/bg.jpg"
        alt=""
        fill
        priority
        className="page-bg"
        sizes="(max-width: 480px) 100vw, 480px"
      />

      {/* Content layer on top of the background */}
      <div className="page-content">
        {/* Spacer for the bg photo area at the top */}
        <div className="hero-spacer" />

        <HeroBanner />

        <div className="title-section">
          <h1 className="title-section__heading">Wedding Seating</h1>
          <p className="title-section__subtitle">ค้นหาโต๊ะงานแต่ง</p>
        </div>

        <SearchBar />
      </div>
    </main>
  );
}

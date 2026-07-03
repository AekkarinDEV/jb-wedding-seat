import Image from "next/image";
import HeroBanner from "@/components/hero-banner";
import SearchBar from "@/components/search-bar";

import ScrollFade from "@/components/scroll-fade";

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

        <ScrollFade>
          <HeroBanner />

          <div className="title-section">
            <h1 className="title-section__heading">ยินดีต้อนรับแขกทุกท่าน</h1>
            <p className="title-section__subtitle">ค้นหาโต๊ะในงานแต่ง</p>
          </div>
        </ScrollFade>

        <SearchBar />
      </div>
    </main>
  );
}

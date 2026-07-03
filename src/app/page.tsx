import HeroBanner from "@/components/hero-banner";
import SearchBar from "@/components/search-bar";

/**
 * Home Page — Guest-facing wedding seating search.
 * Displays the hero banner, title, and search bar.
 * All search logic is client-side via SearchBar component.
 */
export default function HomePage() {
  return (
    <main className="page-container">
      <HeroBanner />

      <div className="title-section">
        <h1 className="title-section__heading">Wedding Seating</h1>
        <p className="title-section__subtitle">ค้นหาโต๊ะงานแต่ง</p>
      </div>

      <SearchBar />
    </main>
  );
}

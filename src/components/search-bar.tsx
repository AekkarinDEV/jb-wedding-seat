"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { SearchX } from "lucide-react";
import { IoMdStarOutline } from "react-icons/io";
import Fuse from "fuse.js";
import type { Guest } from "@/db/schema";
import GuestCard from "./guest-card";

/**
 * SearchBar — Client-side search input with Fuse.js fuzzy matching.
 * Fetches all guests on mount, then searches entirely client-side.
 */
export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [results, setResults] = useState<Guest[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(true);
  const fuseRef = useRef<Fuse<Guest> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all guests once on mount and build search index
  useEffect(() => {
    async function loadGuests() {
      try {
        const res = await fetch("/api/guests");
        const data = await res.json();
        if (data.success && data.data) {
          setGuests(data.data);
          fuseRef.current = new Fuse(data.data, {
            keys: [
              { name: "searchName", weight: 0.7 },
              { name: "fullName", weight: 0.3 },
            ],
            threshold: 0.4,
            minMatchCharLength: 2,
            includeScore: true,
            ignoreLocation: true,
          });
        }
      } catch (error) {
        console.error("Failed to load guests:", error);
      } finally {
        setLoading(false);
      }
    }
    loadGuests();
  }, []);

  const handleSearch = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed || !fuseRef.current) {
      setResults([]);
      setHasSearched(!!trimmed);
      return;
    }

    const searchResults = fuseRef.current.search(trimmed, { limit: 10 });
    setResults(searchResults.map((r) => r.item));
    setHasSearched(true);
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  return (
    <div className={`search-container ${results.length > 0 ? "search-container--with-results" : ""}`}>
      <div className="search-section">
        <div className="search-input-wrapper">
          <span className="search-input-wrapper__icon" aria-hidden="true">
            <Image src="/images/search_icon.svg" alt="Search" width={20} height={20} />
          </span>
          <input
            ref={inputRef}
            id="guest-search-input"
            type="text"
            className="search-input"
            placeholder="พิมพ์ชื่อของท่าน"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            autoComplete="off"
          />
        </div>
        <button
          id="search-button"
          className="search-button"
          onClick={handleSearch}
          disabled={loading || !query.trim()}
        >
          <IoMdStarOutline size={20} />
          {loading ? "กำลังโหลด..." : "ค้นหา"}
          <IoMdStarOutline size={20} />
        </button>
      </div>

      {/* Results */}
      {hasSearched && results.length === 0 && (
        <div className="empty-state">
          <div className="empty-state__icon"><SearchX size={40} /></div>
          <p className="empty-state__text">ไม่พบข้อมูล กรุณาลองค้นหาใหม่</p>
        </div>
      )}

      {results.map((guest) => (
        <GuestCard key={guest.id} guest={guest} />
      ))}
    </div>
  );
}

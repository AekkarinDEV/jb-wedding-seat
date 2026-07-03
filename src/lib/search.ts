import Fuse, { type IFuseOptions } from "fuse.js";
import type { Guest } from "@/db/schema";

/**
 * Fuse.js configuration optimized for Thai text search.
 *
 * Why these settings:
 * - threshold 0.4: Relatively fuzzy to handle Thai spelling variations
 * - minMatchCharLength 2: Thai characters are more information-dense than Latin
 * - keys weighted: searchName is primary, fullName is secondary fallback
 */
const FUSE_OPTIONS: IFuseOptions<Guest> = {
  keys: [
    { name: "searchName", weight: 0.7 },
    { name: "fullName", weight: 0.3 },
  ],
  threshold: 0.4,
  minMatchCharLength: 2,
  includeScore: true,
  ignoreLocation: true, // Search anywhere in the string, not just the beginning
};

/**
 * Creates a Fuse.js search index from an array of guests.
 * The index is created once and reused for multiple searches.
 */
export function createSearchIndex(guests: Guest[]): Fuse<Guest> {
  return new Fuse(guests, FUSE_OPTIONS);
}

/**
 * Searches for guests matching the query using Fuse.js fuzzy search.
 * Returns results sorted by relevance score.
 *
 * @param index - Pre-built Fuse.js search index
 * @param query - Search query string (Thai or English)
 * @param limit - Maximum number of results to return (default: 10)
 */
export function searchGuests(
  index: Fuse<Guest>,
  query: string,
  limit: number = 10
): Guest[] {
  if (!query.trim()) return [];

  const results = index.search(query, { limit });
  return results.map((result) => result.item);
}

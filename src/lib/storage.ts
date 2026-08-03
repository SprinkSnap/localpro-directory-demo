import { SEARCH_LIMITS } from "./config";

const SAVED_KEY = "localpro_saved_listings";
const COMPARE_KEY = "localpro_compare_listings";
const PORTFOLIO_BAR_KEY = "localpro_portfolio_bar_dismissed";

function readIds(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string").slice(0, 100);
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent("localpro:storage", { detail: { key, ids } }));
}

export function getSavedIds(): string[] {
  return readIds(SAVED_KEY);
}

export function isSaved(id: string): boolean {
  return getSavedIds().includes(id);
}

export function toggleSaved(id: string): boolean {
  const ids = getSavedIds();
  const exists = ids.includes(id);
  const next = exists ? ids.filter((x) => x !== id) : [...ids, id];
  writeIds(SAVED_KEY, next);
  return !exists;
}

export function removeSaved(id: string): void {
  writeIds(
    SAVED_KEY,
    getSavedIds().filter((x) => x !== id),
  );
}

export function getCompareIds(): string[] {
  return readIds(COMPARE_KEY).slice(0, SEARCH_LIMITS.maxCompare);
}

export function isCompared(id: string): boolean {
  return getCompareIds().includes(id);
}

export function toggleCompare(id: string): { active: boolean; ids: string[]; limited: boolean } {
  const ids = getCompareIds();
  if (ids.includes(id)) {
    const next = ids.filter((x) => x !== id);
    writeIds(COMPARE_KEY, next);
    return { active: false, ids: next, limited: false };
  }
  if (ids.length >= SEARCH_LIMITS.maxCompare) {
    return { active: false, ids, limited: true };
  }
  const next = [...ids, id];
  writeIds(COMPARE_KEY, next);
  return { active: true, ids: next, limited: false };
}

export function removeCompare(id: string): void {
  writeIds(
    COMPARE_KEY,
    getCompareIds().filter((x) => x !== id),
  );
}

export function clearCompare(): void {
  writeIds(COMPARE_KEY, []);
}

export function isPortfolioBarDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PORTFOLIO_BAR_KEY) === "1";
}

export function dismissPortfolioBar(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PORTFOLIO_BAR_KEY, "1");
}

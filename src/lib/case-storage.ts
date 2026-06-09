import type { Case } from "./case.functions";

const KEY = "silent-watch:case";
const MSGS = "silent-watch:messages";

export function saveCase(c: Case) {
  localStorage.setItem(KEY, JSON.stringify(c));
}
export function loadCase(): Case | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as Case) : null;
}
export function clearCase() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(MSGS);
}
export function saveMessages(m: unknown) {
  localStorage.setItem(MSGS, JSON.stringify(m));
}
export function loadMessages<T = unknown>(): T[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(MSGS);
  return raw ? (JSON.parse(raw) as T[]) : [];
}

export function escapeRegExp(s: string): string {
  return String(s).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
}

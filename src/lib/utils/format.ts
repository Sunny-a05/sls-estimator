/**
 * Format minutes into human-readable string (e.g., "2h 30m").
 */
export function fmtMin(m: number): string {
  if (!m || m <= 0) return "—";
  let h = Math.floor(m / 60);
  let min = Math.round(m % 60);
  if (min === 60) {
    h += 1;
    min = 0;
  }
  if (h === 0) return `${min}m`;
  if (min === 0) return `${h}h`;
  return `${h}h ${min}m`;
}

/**
 * Format Thai Baht currency.
 */
export function thb(v: number): string {
  return "฿" + Math.round(v).toLocaleString();
}

/**
 * Format file size in human-readable form.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

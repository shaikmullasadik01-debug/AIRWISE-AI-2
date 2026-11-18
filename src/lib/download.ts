/**
 * Sanitizes client-side export filenames to prevent path traversal or control characters.
 */
export function sanitizeDownloadFilename(filename: string): string {
  const cleaned = filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .replace(/^[._]+/, '');
  return cleaned.length > 0 ? cleaned.slice(0, 120) : 'airwise-export.txt';
}

/**
 * Triggers a safe client-side file download from in-memory text content
 * and defers object URL revocation to prevent premature cleanup in Safari/Firefox.
 */
export function downloadTextFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = sanitizeDownloadFilename(filename);
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

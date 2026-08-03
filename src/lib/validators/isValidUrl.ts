export function isValidURLToBeShortener(
  url: string | null | undefined,
): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url);

    // Check for valid protocols
    if (!(parsed.protocol === 'http:' || parsed.protocol === 'https:')) {
      return false;
    }

    // Ensure hostname exists and has at least one dot (TLD)
    if (!parsed.hostname || !parsed.hostname.includes('.')) {
      return false;
    }

    // Additional validation: hostname shouldn't be just IP addresses
    const hostname = parsed.hostname.toLowerCase();
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return false; // Reject pure IP addresses
    }

    return true;
  } catch {
    return false;
  }
}

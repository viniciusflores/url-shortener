interface SanitizedEnv {
  BASE_URL: string;
}

/**
 * Validates and sanitizes environment variables using native JavaScript.
 * Halts the process with an error message if any validation fails.
 */
export function validateAndSanitizeEnv(
  rawEnv: Record<string, string>,
): SanitizedEnv {
  // 1. Extract and sanitize BASE_URL (strips accidental wrapper quotes and whitespace)
  const rawBaseUrl = rawEnv.BASE_URL || '';
  const cleanBaseUrl = rawBaseUrl.replace(/^['"]|['"]$/g, '').trim();

  // 2. Validate presence and HTTP/HTTPS URL format using native Regex
  const urlRegex = /^https?:\/\/[^\s$.?#].[^\s]*$/i;

  if (!cleanBaseUrl) {
    console.error('❌ Invalid environment configuration:\n');
    console.error('Error: BASE_URL environment variable is missing or empty.');
    process.exit(1);
  }

  if (!urlRegex.test(cleanBaseUrl)) {
    console.error('❌ Invalid environment configuration:\n');
    console.error(
      `Error: BASE_URL ("${cleanBaseUrl}") must be a valid HTTP or HTTPS URL.`,
    );
    process.exit(1);
  }

  return {
    BASE_URL: cleanBaseUrl,
  };
}

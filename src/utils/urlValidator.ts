const isValidURL = (url: string | null | undefined): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);

    return (
      (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
      parsed.hostname.includes('.')
    );
  } catch {
    return false;
  }
};

export { isValidURL };

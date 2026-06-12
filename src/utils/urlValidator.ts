const isValidURL = (url: string | null | undefined): boolean => {
  if (!url) {
    return false;
  }
  const isValid = url.match(/^https?:\/\/(www\.)?[\w\W]+/);
  return !!isValid;
};

export { isValidURL };

const isValidURL = (url) => {
  if (!url) {
    return false;
  }
  const isValid = url.match(/^https?:\/\/(www\.)?[\w\W]+/);
  return isValid;
};

export { isValidURL };

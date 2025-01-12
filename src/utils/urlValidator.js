function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export { isValidURL };

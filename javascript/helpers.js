const formatUrl = (url) => {
  return url
    .replace(/^https?:\/\/(www\.)?/, "")
    .replace(/\/$/, "")
    .replace(/^www\./, "");
};

const fuzzyMatch = (searchTerm, target) => {
  const searchTermFormatted = formatUrl(searchTerm || "");
  const targetFormatted = formatUrl(target || "");
  return (
    searchTermFormatted.includes(targetFormatted) ||
    targetFormatted.includes(searchTermFormatted)
  );
};

export { fuzzyMatch, formatUrl };



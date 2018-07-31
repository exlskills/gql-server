export const singleToDoubleQuotes = strIn => {
  if (strIn.startsWith("{'")) {
    return strIn.replace(/'/g, '"');
  }
  return strIn;
};

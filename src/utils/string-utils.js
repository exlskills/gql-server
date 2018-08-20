export const singleToDoubleQuotes = strIn => {
  if (strIn.startsWith("{'")) {
    return strIn.replace(/'/g, '"');
  }
  return strIn;
};

export const removeStringFromText = (strToRemove, textIn) => {
  let n = textIn.search(strToRemove);
  while (n > -1) {
    textIn = textIn.substring(0, n) + textIn.substring(n + strToRemove.length);
    n = textIn.search(strToRemove);
  }
  return textIn;
};


export const setDefaultIntlStringLocale = (field, defLocale) => {
  console.log(`in setDefaultIntlStringLocale`);
  const index = field.intlString.findIndex(item => item.locale === defLocale);
  if (index === -1) {
    return field;
  }

  for (let item of field.intlString) {
    item.is_default = item.locale === defLocale;
  }

  return field;
};

export const updateIntlStringObject = (field, locale, newVal) => {
  console.log(` in updateIntlStringObject`);
  const index = field.intlString.findIndex(item => item.locale === locale);

  if (index !== -1) {
    field.intlString[index].content = newVal;
  } else {
    field.intlString.push({
      locale: locale,
      content: newVal,
      is_default: field.intlString.length === 0
    });
  }

  return field;
};

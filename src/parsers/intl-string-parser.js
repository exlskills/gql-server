export const getStringByLocale = (intlString, locale) => {
  if (intlString && Array.isArray(intlString.intlString)) {
    let result;
    result = intlString.intlString.find(elem => elem.locale == locale);
    if (!result) {
      result = intlString.intlString.find(elem => elem.is_default);
    }
    if (!result) {
      return { err: 'not found', text: '' };
    }
    return { err: '', text: result.content };
  } else {
    return { err: 'empty or not array', text: '' };
  }
};

export const updateIntlStringObject = (field, locale, newVal) => {
  const index = field.intlString.findIndex(item => item.locale == locale);

  if (index != -1) {
    field.intlString[index].content = newVal;
  } else {
    field.intlString.push({
      locale: locale,
      content: newVal,
      is_default: field.intlString.length == 0
    });
  }

  return field;
};

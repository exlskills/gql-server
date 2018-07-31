export const reverseSortByObject = input => {
  const output = {};
  Object.keys(input).forEach(key => {
    if (input[key] === 1 || input[key] === -1) output[key] = input[key] * -1;
  });
  return output;
};

export const getValueByPathToKey = (obj, path) => {
  let value = obj;
  const parts = path.split('.');
  if (parts.length) {
    path.split('.').filter(Boolean).forEach(part => {
      value = value[part];
    });
  } else {
    value = obj[path];
  }
  return value;
};

export const gqlOrderByToMdbSort = gqlOrderBy => {
  if (gqlOrderBy) {
    if (Object.prototype.toString.call(gqlOrderBy) === '[object Array]') {
      return gqlOrderBy.reduce(
        (prev, curr) =>
          Object.assign({}, prev, {
            [curr.field]: curr.direction
          }),
        {}
      );
    }
    return {
      [gqlOrderBy.field]: gqlOrderBy.direction
    };
  }
  // Forced default sort order (_id or sort order is required for paging)
  return { _id: 1 };
};

export async function basicFind(
  model,
  runParams,
  queryVal,
  sortVal,
  selectVal
) {
  let result, queryFunc;

  if (runParams && queryVal) {
    if (runParams.isById) {
      queryFunc = model.findById(queryVal);
    } else if (runParams.isOne) {
      queryFunc = model.findOne(queryVal);
    } else {
      queryFunc = model.find(queryVal);
    }
  } else if (runParams && runParams.isAll) {
    queryFunc = model.find();
  } else if (queryVal) {
    queryFunc = model.find(queryVal);
  } else {
    console.error('Invalid call parameters provided');
    return Promise.reject('Invalid call parameters provided');
  }

  if (sortVal) {
    queryFunc = queryFunc.sort(sortVal);
  }
  if (selectVal) {
    queryFunc = queryFunc.select(selectVal);
  }

  try {
    result = await queryFunc.exec();
    return result;
  } catch (err) {
    console.error('Find failed', err);
    return Promise.reject('Find failed', err);
  }
}

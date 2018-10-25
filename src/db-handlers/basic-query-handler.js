import { logger } from '../utils/logger';

/**
 *
 * @param model
 * @param runParams
 * @param queryVal
 * @param sortVal
 * @param selectVal  e.g., { name: 1, occupation: 1 }
 * @returns {Promise<*>}
 *
 * NOTE:
 * - model.findById and model.findOne return an Object or null if not found
 *       to ensure the record was found, check the return Object
 * - model.find returns an array of Objects - an empty Array if nothing found
 *       check the return value and value.length > 0
 */

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
    logger.error('Invalid call parameters provided');
    return Promise.reject('Invalid call parameters provided');
  }

  if (sortVal) {
    queryFunc = queryFunc.sort(sortVal);
  }
  if (selectVal) {
    queryFunc = queryFunc.select(selectVal);
  }

  try {
    return await queryFunc.exec();
  } catch (err) {
    logger.error(`Find failed ` + err + `; model ` + model);
    return Promise.reject('Find failed', err);
  }
}

import { basicFind } from '../db-handlers/basic-query-handler';
import Path from '../db-models/path-model.js';
import { logger } from '../utils/logger';

export const fetchById = async (obj_id, selectVal, viewer, info) => {
  logger.debug(`in Path fetchById`);
  let record;
  try {
    //model, runParams, queryVal, sortVal, selectVal
    record = await basicFind(Path, { isById: true }, obj_id, null, selectVal);
  } catch (errInternalAlreadyReported) {
    return null;
  }
  return record;
};

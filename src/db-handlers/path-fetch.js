import { basicFind } from '../db-handlers/basic-query-handler';
import Path from '../db-models/path-model.js';
import { logger } from '../utils/logger';

export const findById = async (obj_id, viewer, info) => {
  logger.debug(`in Path findById`);
  let record;
  try {
    //model, runParams, queryVal, sortVal, selectVal
    record = await basicFind(Path, { isById: true }, obj_id);
  } catch (errInternalAlreadyReported) {
    return null;
  }
  return record;
};

import { basicFind } from '../db-handlers/basic-query-handler';
import Path from '../db-models/path-model.js';

export const findById = async (obj_id, viewer, info) => {
  let record;
  try {
    //model, runParams, queryVal, sortVal, selectVal
    record = await basicFind(Path, { isById: true }, obj_id);
  } catch (errInternalAllreadyReported) {
    return null;
  }
  return record;
};

import { basicFind } from '../db-handlers/basic-query-handler';
import Organization from '../db-models/organization-model.js';

export const findById = async (obj_id, viewer, info) => {
  let record;
  try {
    //model, runParams, queryVal, sortVal, selectVal
    record = await basicFind(Organization, { isById: true }, obj_id);
  } catch (errInternalAllreadyReported) {
    return null;
  }
  return record;
};

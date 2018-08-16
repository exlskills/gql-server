import { basicFind } from '../db-handlers/basic-query-handler';
import CardInteraction from '../db-models/card-interaction-model.js';

export const findById = async (obj_id, viewer, info) => {
  console.log(`in Card Interaction findById`);
  let record;
  try {
    //model, runParams, queryVal, sortVal, selectVal
    record = await basicFind(CardInteraction, { isById: true }, obj_id);
  } catch (errInternalAllreadyReported) {
    return null;
  }
  return record;
};

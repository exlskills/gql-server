import { basicFind } from '../db-handlers/basic-query-handler';
import CardInteraction from '../db-models/card-interaction-model.js';
import { logger } from '../utils/logger';

export const findById = async (obj_id, viewer, info) => {
  logger.debug(`in Card interaction findById`);
  let record;
  try {
    //model, runParams, queryVal, sortVal, selectVal
    record = await basicFind(CardInteraction, { isById: true }, obj_id);
  } catch (errInternalAlreadyReported) {
    return null;
  }
  return record;
};

export const checkUserViewedCard = async (user_id, card_id) => {
  logger.debug(`in checkUserViewedCard`);
  let record;
  try {
    record = await basicFind(CardInteraction, null, { user_id, card_id });
  } catch (errInternalAlreadyReported) {
    return null;
  }
  return record;
};

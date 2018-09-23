import { basicFind } from '../db-handlers/basic-query-handler';
import CardInteraction from '../db-models/card-interaction-model.js';
import { logger } from '../utils/logger';

export const fetchById = async (obj_id, selectVal, viewer, info) => {
  logger.debug(`in Card interaction fetchById`);
  let record;
  try {
    //model, runParams, queryVal, sortVal, selectVal
    record = await basicFind(
      CardInteraction,
      { isById: true },
      obj_id,
      null,
      selectVal
    );
  } catch (errInternalAlreadyReported) {
    return null;
  }
  return record;
};

export const checkUserViewedCard = async (user_id, card_id) => {
  logger.debug(`in checkUserViewedCard`);
  let record;
  try {
    record = await basicFind(CardInteraction, null, {
      user_id: user_id,
      card_id: card_id
    });
    logger.debug(`     checkUserViewedCard record ` + JSON.stringify(record));
  } catch (errInternalAlreadyReported) {
    return null;
  }
  return record;
};

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

export const fetchByUserIdAndCardId = async (user_id, card_id, selectVal) => {
  try {
    return await basicFind(
      CardInteraction,
      { isOne: true },
      { user_id, card_id },
      null,
      selectVal
    );
  } catch (err) {
    return null;
  }
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

export const getLastAccessedCourseItemForUser = async (user_id, course_id) => {
  logger.debug(`in getLastAccessedCourseItemForUser`);

  const result = {
    last_accessed_unit: '',
    last_accessed_section: '',
    last_accessed_card: ''
  };

  // Search by course_item_ref
  let cardInteractionRec;
  try {
    cardInteractionRec = await CardInteraction.findOne({
      user_id: user_id,
      'course_item_ref.course_id': course_id
    })
      .sort({ updated_at: -1 })
      .select({ updated_at: 1, card_id: 1, course_item_ref: 1 })
      .exec();

    logger.debug(`  cardInteractionRec ` + JSON.stringify(cardInteractionRec));
  } catch (err) {
    logger.error(`CardInteraction.findOne failed ` + err);
  }
  if (cardInteractionRec) {
    result.last_accessed_unit = cardInteractionRec.course_item_ref.unit_id;
    result.last_accessed_section =
      cardInteractionRec.course_item_ref.section_id;
    result.last_accessed_card = cardInteractionRec.card_id;
  }

  logger.debug(
    `  getLastAccessedCourseItemForUser result ` + JSON.stringify(result)
  );
  return result;
};

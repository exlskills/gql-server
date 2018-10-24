import { logger } from '../utils/logger';
import { computeQuestionsEMA } from '../db-handlers/question-interaction-fetch';
import { checkUserViewedCard } from '../db-handlers/card-interaction-fetch';

// FUTURE: use for layered GQL queries

export const resolveSectionCardEma = async (obj, args, viewer, info) => {
  //  logger.debug(`in -----> resolveSectionCardEma`);
  //  logger.debug(`  obj ` + JSON.stringify(obj));
  let ema = 0;
  if (obj) {
    ema = determineCardEma(viewer.user_id, obj);
  }
  logger.debug(`  card ema ` + ema);
  return ema;
};

export const resolveUnitSectionEma = async (obj, args, viewer, info) => {
  //  logger.debug(`in -----> resolveUnitSectionEma`);
  //  logger.debug(`  obj ` + JSON.stringify(obj));
  let avdEma = 0;
  let sumEma = 0;
  let countEma = 0;
  // The "obj" already contains all the Cards
  // Re-write of that changes in the top-level design
  if (obj && obj.cards) {
    for (let card of obj.cards.Cards) {
      sumEma += determineCardEma(viewer.user_id, card);
      countEma++;
    }
  }
  avdEma = countEma > 0 ? sumEma / countEma : avdEma;
  logger.debug(`  section ema ` + avgEma);
  return avdEma;
};

export const resolveCourseUnitEma = async (obj, args, viewer, info) => {
  logger.debug(`in -----> resolveCourseUnitEma`);
  logger.debug(`  obj ` + JSON.stringify(obj));

  let avdEma = 0;
  let sumEma = 0;
  let countEma = 0;
  // The "obj" already contains all the Cards
  // Re-write of that changes in the top-level design
  if (obj && obj.sections_list) {
    for (let section of obj.sections_list) {
      if (!section.cards) continue;
      for (let card of section.cards.Cards) {
        sumEma += determineCardEma(viewer.user_id, card);
        countEma++;
      }
    }
  }
  avdEma = countEma > 0 ? sumEma / countEma : avdEma;
  logger.debug(`  unit ema ` + avgEma);
  return avdEma;
};

export const determineCardEma = async (userId, card) => {
  let ema = 0;
  if (card.question_ids && card.question_ids.length > 0) {
    ema = await computeQuestionsEMA(userId, card.question_ids);
  } else {
    const user_card_view = await checkUserViewedCard(userId, card._id);
    if (user_card_view && user_card_view.length > 0) {
      ema = 100;
    }
  }
  return ema;
};

export const resolveCourseUnitProgressState = (obj, args, viewer, info) => {
  logger.debug(`in -----> resolveCourseUnitProgressState`);
  logger.debug(`  obj ` + JSON.stringify(obj));
  // FUTURE
};

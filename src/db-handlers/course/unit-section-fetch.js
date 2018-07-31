import Course from '../../db-models/course-model';
import * as QuestionInteractionFetch from '../../db-handlers/question-interaction-fetch';
import * as projectionWriter from '../../utils/projection-writer';
import Config from '../.././config';

export const computeCardEMA = async (userId, questionIds) => {
  const N = Config.card_ema.n;
  const K = 2 / (N + 1);
  let quesInters = [];

  try {
    quesInters = await QuestionInteractionFetch.findByQuestionIds(
      userId,
      questionIds,
      'quiz',
      { sort: { updated_at: -1 }, limit: N }
    );
  } catch (err) {
    return Promise.reject(err);
  }

  if (quesInters.length > 0) {
    let arrayScores = [];
    let sumQuesInters = 0.0;
    for (let item of quesInters) {
      const pct_score = item.pct_score ? item.pct_score : 0;
      arrayScores.push(pct_score);
      sumQuesInters += pct_score;
    }
    const ema0 = sumQuesInters / quesInters.length;
    let currEma = ema0;
    for (let score of arrayScores) {
      currEma = (score - currEma) * K + currEma;
    }
    return currEma;
  }

  return null;
};

export const fetchUnitSections = async (
  filterValues,
  aggregateArray,
  viewerLocale,
  fetchParameters
) => {
  let sort = { $sort: { index: 1 } };
  let skip = aggregateArray.find(item => !!item.$skip);
  let limit = aggregateArray.find(item => !!item.$limit);

  let array = [];
  let elem;

  const userId = fetchParameters.userId;

  elem = { $match: { _id: fetchParameters.courseId } };
  array.push(elem);

  elem = { $addFields: { 'units.Units.sections.currentCourseId': '$_id' } };
  array.push(elem);

  elem = { $replaceRoot: { newRoot: '$units' } };
  array.push(elem);

  elem = {
    $project: {
      Units: {
        $filter: {
          input: '$Units',
          cond: { $eq: ['$$this._id', fetchParameters.unitId] }
        }
      },
      'sections.currentCourseId': 1
    }
  };
  array.push(elem);

  elem = { $unwind: '$Units' };
  array.push(elem);

  elem = { $addFields: { 'Units.sections.currentUnitId': '$Units._id' } };
  array.push(elem);

  elem = { $replaceRoot: { newRoot: '$Units.sections' } };
  array.push(elem);

  elem = { $unwind: '$Sections' };
  array.push(elem);
  if (fetchParameters.sectionId) {
    elem = { $match: { 'Sections._id': fetchParameters.sectionId } };
    array.push(elem);
  }
  elem = {
    $project: {
      'title.intlString': projectionWriter.writeIntlStringFilter(
        'Sections.title',
        viewerLocale
      ),
      'headline.intlString': projectionWriter.writeIntlStringFilter(
        'Sections.headline',
        viewerLocale
      ),
      // cards_list: '$Sections.cards.Cards',
      _id: '$Sections._id',
      index: '$Sections.index',
      currentCourseId: 1,
      currentUnitId: 1
    }
  };
  array.push(elem);

  elem = {
    $project: {
      title: projectionWriter.writeIntlStringEval('title', viewerLocale),
      headline: projectionWriter.writeIntlStringEval('headline', viewerLocale),
      // cards_list: 1,
      _id: 1,
      index: 1,
      currentCourseId: 1,
      currentUnitId: 1
    }
  };
  array.push(elem);

  if (sort) array.push(sort);
  if (skip) array.push(skip);
  if (limit) array.push(limit);

  let arrayRet = await Course.aggregate(array).exec();

  // for (let section of arrayRet) {
  //   for (let card of section.cards_list) {
  //     card.title = getStringByLocale(card.title, viewerLocale).text;
  //     card.headline = getStringByLocale(card.headline, viewerLocale).text;
  //     card.ema = await computeCardEMA(userId, card.question_ids);
  //   }
  // }
  return arrayRet;
};

import Course from '../../db-models/course-model';
import * as projectionWriter from '../../utils/projection-writer';
import { fetchExamSessionsByUserAndUnitJoinExam } from '../exam-session-fetch';
import { getStringByLocale } from '../../parsers/intl-string-parser';
import { computeQuestionsEMA } from '../question-interaction-fetch';
import { fetchLastCancExamSessionByUserUnit } from '../exam-session-fetch';
import { logger } from '../../utils/logger';
import { checkUserViewedCard } from '../../db-handlers/card-interaction-fetch';
import { fetchSectionCardIDsForUnit } from './section-card-fetch';
import { fetchExamSessionsByUserAndUnitToday } from '../exam-session-fetch';
import { basicFind } from '../basic-query-handler';

export const fetchByCourseAndUnitId = async (
  course_id,
  unit_id,
  unitFieldsProjectObj,
  viewer,
  info
) => {
  logger.debug(`in fetchByCourseAndUnitId`);
  let array = [];
  let elem;

  elem = { $match: { _id: course_id } };
  array.push(elem);

  elem = { $addFields: { 'units.Units.currentCourseId': '$_id' } };
  array.push(elem);

  elem = { $replaceRoot: { newRoot: '$units' } };
  array.push(elem);
  elem = { $unwind: '$Units' };
  array.push(elem);

  elem = { $match: { 'Units._id': unit_id } };
  array.push(elem);

  let projectObj = {
    _id: '$Units._id',
    course_id: '$Units.currentCourseId'
  };

  projectObj = { ...projectObj, ...unitFieldsProjectObj };

  elem = { $project: projectObj };
  array.push(elem);

  const result = await Course.aggregate(array).exec();

  logger.debug('  result ' + JSON.stringify(result));
  if (!result || result.length < 1) {
    return null;
  }
  return result[0];
};

export const fetchCourseUnitsBase = async (
  filterValues,
  aggregateArray,
  viewerLocale,
  fetchParameters,
  include_sections = false
) => {
  logger.debug(`in fetchCourseUnitsBase`);
  logger.debug(`  fetchParameters ` + JSON.stringify(fetchParameters));
  let array = [];
  let elem;

  elem = { $match: { _id: fetchParameters.courseId } };
  array.push(elem);

  elem = { $addFields: { 'units.Units.currentCourseId': '$_id' } };
  array.push(elem);

  elem = { $replaceRoot: { newRoot: '$units' } };
  array.push(elem);
  elem = { $unwind: '$Units' };
  array.push(elem);

  // Filter By specific Unit
  if (fetchParameters.unitId) {
    elem = { $match: { 'Units._id': fetchParameters.unitId } };
    array.push(elem);
  }

  if (fetchParameters.unitIndex) {
    elem = { $match: { 'Units.index': fetchParameters.unitIndex } };
    array.push(elem);
  }

  elem = {
    $project: {
      index: '$Units.index',
      title: '$Units.title',
      attempts_allowed_per_day: '$Units.attempts_allowed_per_day',
      headline: '$Units.headline',
      _id: '$Units._id',
      currentCourseId: '$Units.currentCourseId'
    }
  };
  if (include_sections) {
    elem.$project.sections_list = '$Units.sections.Sections';
  }
  array.push(elem);
  elem = {
    $project: {
      attempts_allowed_per_day: 1,
      _id: '$_id',
      index: 1,
      title: 1,
      headline: 1,
      currentCourseId: 1
    }
  };
  if (include_sections) {
    elem.$project.sections_list = 1;
  }
  array.push(elem);
  elem = {
    $project: {
      'title.intlString': projectionWriter.writeIntlStringFilter(
        'title',
        viewerLocale
      ),
      'headline.intlString': projectionWriter.writeIntlStringFilter(
        'headline',
        viewerLocale
      ),
      attempts_allowed_per_day: 1,
      _id: 1,
      index: 1,
      currentCourseId: 1
    }
  };
  if (include_sections) {
    elem.$project.sections_list = 1;
  }

  array.push(elem);
  elem = {
    $project: {
      title: projectionWriter.writeIntlStringEval('title', viewerLocale),
      headline: projectionWriter.writeIntlStringEval('headline', viewerLocale),
      attempts_allowed_per_day: 1,
      _id: 1,
      index: 1,
      currentCourseId: 1
    }
  };
  if (include_sections) {
    elem.$project.sections_list = 1;
  }

  array.push(elem);

  if (aggregateArray) {
    // array.push(...aggregateArray);
    // let sort = aggregateArray.find(item => !!item.$sort);
    let sort = { $sort: { index: 1 } };
    let skip = aggregateArray.find(item => !!item.$skip);
    let limit = aggregateArray.find(item => !!item.$limit);

    if (sort) array.push(sort);
    if (skip) array.push(skip);
    if (limit) array.push(limit);
  }

  const result = await Course.aggregate(array).exec();

  logger.debug('fetchCourseUnitsBase result ' + JSON.stringify(result));
  return result;
};

export const fetchCourseUnitsWithDetailedStatus = async (
  filterValues,
  aggregateArray,
  viewerLocale,
  fetchParameters
) => {
  logger.debug(`in fetchCourseUnitsWithDetailedStatus`);

  // TODO: this currently pulls everything down to the card ID level in one query
  // Review if a layered GQL fetch can be more efficient (driven by FE design)

  const arrayCourseUnitsDetails = await fetchCourseUnitsBase(
    filterValues,
    aggregateArray,
    viewerLocale,
    fetchParameters,
    true
  );

  const userId = fetchParameters.userId;

  const examStatusByCourseUnit = await fetchUserCourseUnitExamStatus(
    filterValues,
    aggregateArray,
    viewerLocale,
    fetchParameters
  );

  // Get individual Secions and Cards and calculate the progress status
  for (let unitElem of arrayCourseUnitsDetails) {
    unitElem.attempts_left = 0;
    unitElem.is_continue_exam = false;
    unitElem.exam_ = '';
    let unitEmaSum = 0;
    let unitEmaCount = 0;
    let sectionArray = [];
    if (unitElem.sections_list) {
      sectionArray = unitElem.sections_list.sort(
        (it1, it2) => (it1.index || 0) - (it2.index || 0)
      );
    }

    // Unit Sections
    if (sectionArray.length > 0) {
      for (let sectionElem of sectionArray) {
        let sectEmaSum = 0;
        let sectEmaCount = 0;
        sectionElem.title = getStringByLocale(
          sectionElem.title,
          viewerLocale
        ).text;
        sectionElem.headline = getStringByLocale(
          sectionElem.headline,
          viewerLocale
        ).text;

        // Section Cards
        let cardArray = [];
        if (sectionElem.cards.Cards) {
          cardArray = sectionElem.cards.Cards.sort(
            (it1, it2) => (it1.index || 0) - (it2.index || 0)
          );
        }
        sectionElem.cards_list = cardArray;
        if (cardArray.length > 0) {
          for (let card of cardArray) {
            card.ema = 0;
            card.title = getStringByLocale(card.title, viewerLocale).text;
            card.headline = getStringByLocale(card.headline, viewerLocale).text;
            if (card.question_ids && card.question_ids.length > 0) {
              card.ema = await computeQuestionsEMA(userId, card.question_ids);
            } else {
              const user_card_view = await checkUserViewedCard(
                userId,
                card._id
              );
              // logger.debug(' user_card_view ' + JSON.stringify(user_card_view));
              if (user_card_view && user_card_view.length > 0) {
                card.ema = 100;
              }
            }
            sectEmaSum += card.ema;
            sectEmaCount++;
          }
        }

        // End of Section
        unitEmaSum += sectEmaSum;
        unitEmaCount += sectEmaCount;
        sectionElem.ema = sectEmaCount > 0 ? sectEmaSum / sectEmaCount : 0;
      }
    }

    unitElem.ema = unitEmaCount > 0 ? unitEmaSum / unitEmaCount : 0;
    unitElem.unit_progress_state = unitElem.ema > 0 ? 0 : -1;

    // Course Unit Exam Attempts
    unitElem.grade = 0;
    unitElem.attempts_left = unitElem.attempts_allowed_per_day;

    const examStatusUnitIndex = examStatusByCourseUnit.findIndex(
      x => x._id === unitElem._id
    );
    if (examStatusUnitIndex >= 0) {
      unitElem.grade = examStatusByCourseUnit[examStatusUnitIndex].grade;
      if (examStatusByCourseUnit[examStatusUnitIndex].passed) {
        unitElem.unit_progress_state = 1;
      }

      unitElem.attempts = examStatusByCourseUnit[examStatusUnitIndex].attempts;
      unitElem.attempts_left =
        examStatusByCourseUnit[examStatusUnitIndex].attempts_left;
      unitElem.last_attempted_at =
        examStatusByCourseUnit[examStatusUnitIndex].last_attempted_at;
      unitElem.final_exam_weight_pct =
        examStatusByCourseUnit[examStatusUnitIndex].final_exam_weight_pct;
      unitElem.passed = examStatusByCourseUnit[examStatusUnitIndex].passed;

      let lastCancelled = await fetchLastCancExamSessionByUserUnit(
        userId,
        unitElem._id
      );
      if (lastCancelled && lastCancelled.isContinue === true) {
        unitElem.is_continue_exam = true;
        unitElem.exam_ = lastCancelled._id;
      }
    }
  } // End of loop on Course Units

  logger.debug(
    `fetchCourseUnitsWithDetailedStatus result ` +
      JSON.stringify(arrayCourseUnitsDetails)
  );
  return arrayCourseUnitsDetails;
};

export const fetchUserCourseUnitExamStatus = async (
  filterValues,
  aggregateArray,
  viewerLocale,
  fetchParameters
) => {
  logger.debug(`in fetchUserCourseUnitExamStatus`);
  logger.debug(`   filterValues ` + JSON.stringify(filterValues));
  logger.debug(`   aggregateArray ` + JSON.stringify(aggregateArray));
  logger.debug(`   viewerLocale ` + viewerLocale);
  logger.debug(`   fetchParameters ` + JSON.stringify(fetchParameters));

  let array = [];
  let selectFields = {};

  // Find the course
  array.push({ $match: { _id: fetchParameters.courseId } });
  array.push({ $unwind: '$units.Units' });
  array.push({ $addFields: { 'units.Units.currentCourseId': '$_id' } });
  array.push({ $replaceRoot: { newRoot: '$units.Units' } });

  selectFields.currentCourseId = 1;
  selectFields.final_exam_weight_pct = 1;
  selectFields.attempts_allowed_per_day = 1;

  array.push({
    $project: {
      ...selectFields,
      'title.intlString': projectionWriter.writeIntlStringFilter(
        'title',
        viewerLocale
      )
    }
  });
  array.push({
    $project: {
      ...selectFields,
      title: projectionWriter.writeIntlStringEval('title', viewerLocale)
    }
  });
  selectFields.title = 1;

  const result = await Course.aggregate(array).exec();
  logger.debug(
    `fetchUserCourseUnitExamStatus Course-Unit fetch result ` +
      JSON.stringify(result)
  );

  const attemptSort = { submitted_at: -1, started_at: -1 };
  for (let unit of result) {
    // Process Exam Attempts for the User - Course Unit
    let examAttempts = [];
    try {
      examAttempts = await fetchExamSessionsByUserAndUnitJoinExam(
        fetchParameters.userId,
        unit._id,
        {
          sort: attemptSort,
          includeExam: true
        }
      );
    } catch (error) {
      // Ignore
    }

    logger.debug(
      `fetchExamAttemptsByUserAndUnitJoinExam fetch result ` +
        JSON.stringify(examAttempts)
    );

    unit.attempts = 0;
    unit.attempts_left = unit.attempts_allowed_per_day;
    unit.grade = 0;
    unit.passed = false;
    if (examAttempts && examAttempts.length > 0) {
      logger.debug(`in the attempts analysis`);

      unit.attempts = examAttempts.length;
      const latestAttempt = examAttempts[0];
      unit.last_attempted_at =
        latestAttempt.submitted_at || latestAttempt.started_at;

      const today = new Date().toDateString();
      const attemptsToday = examAttempts.filter(
        item =>
          item.started_at.toDateString() === today ||
          (item.submitted_at && item.submitted_at.toDateString() === today)
      ).length;

      unit.attempts_left = unit.attempts_allowed_per_day - attemptsToday;
      if (unit.attempts_left < 0) {
        unit.attempts_left = 0;
      }

      unit.grade = Math.max(
        ...examAttempts.map(item => item.final_grade_pct || 0)
      );

      for (let examAttempt of examAttempts) {
        if (examAttempt.final_grade_pct >= examAttempt.exam.pass_mark_pct) {
          unit.passed = true;
          break;
        }
      }
    } // End of work with Exam Attempts

    const cardsAndQuestions = await fetchSectionCardIDsForUnit(
      fetchParameters.courseId,
      unit._id
    );

    unit.sections_list = [];
    for (let section of cardsAndQuestions.unit.sections.Sections) {
      logger.debug(`   section ` + section._id);
      let sectionObj = { _id: section._id };

      let sectionCardsList = [];
      for (let card of section.cards.Cards) {
        let cardObj = { _id: card._id };
        cardObj.ema = 0;
        if (card.question_ids && card.question_ids.length > 0) {
          cardObj.ema = await computeQuestionsEMA(
            fetchParameters.userId,
            card.question_ids
          );
          cardObj.ema = cardObj.ema === null ? 0 : cardObj.ema;
        } else {
          const user_card_view = await checkUserViewedCard(
            fetchParameters.userId,
            card._id
          );
          if (user_card_view && user_card_view.lenght > 0) {
            cardObj.ema = 100;
          }
        }
        sectionCardsList.push(cardObj);
      }

      sectionObj.cards_list = sectionCardsList;

      unit.sections_list.push(sectionObj);
    } // End of loop on sections
  } // End of loop on Units of the Course

  logger.debug(
    `OUTPUT fetchUserCourseUnitExamStatus result ` + JSON.stringify(result)
  );
  return result;
};

export const fetchCourseUnitById = async (
  unit_id,
  course_id,
  user_id,
  viewer
) => {
  logger.debug(`in fetchCourseUnitById`);

  let viewerLocale = viewer.locale;

  let fetchParameters = {
    courseId: course_id,
    unitId: unit_id
  };

  let arrayRet = await fetchCourseUnitsBase(
    null,
    null,
    viewerLocale,
    fetchParameters,
    true
  );

  for (let unitElem of arrayRet) {
    // NOTE: arrayRet has 1 element only as unit_id is in the fetchParameters

    for (let sectionElem of unitElem.sections_list) {
      sectionElem.title = getStringByLocale(
        sectionElem.title,
        viewerLocale
      ).text;
      sectionElem.headline = getStringByLocale(
        sectionElem.headline,
        viewerLocale
      ).text;
    }

    unitElem.attempts_left = 0;
    const arrayAttempts = await fetchExamSessionsByUserAndUnitToday(
      user_id,
      unitElem._id
    );
    if (arrayAttempts.length > 0) {
      unitElem.attempts_left =
        unitElem.attempts_allowed_per_day - arrayAttempts.length;
    } else {
      unitElem.attempts_left = unitElem.attempts_allowed_per_day;
    }

    // All these are undefined now
    unitElem.ema = 0.0;
    unitElem.unit_progress_state = 0;
    unitElem.grade = 0;
  }
  return arrayRet[0];
};

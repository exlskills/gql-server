import Course from '../../db-models/course-model';
import * as UserFetch from '../../db-handlers/user/user-fetch';
import * as projectionWriter from '../../utils/projection-writer';
import * as ExamAttemptFetch from '../../db-handlers/exam-attempt-fetch';
import * as ExamFetch from '../../db-handlers/exam-fetch';
import moment from 'moment';
import { getStringByLocale } from '../../parsers/intl-string-parser';
import { computeCardEMA } from './unit-section-fetch';
import ExamAttempt from '../../db-models/exam-attempt-model';
import { fetchLastCancelledExamAttempt } from '../exam-attempt-fetch';
import { logger } from '../../utils/logger';

export const fetchCourseUnitsBase = async (
  filterValues,
  aggregateArray,
  viewerLocale,
  fetchParameters
) => {
  logger.debug(`in fetchCourseUnitsBase`);
  let array = [];
  let elem;

  const userId = fetchParameters.userId;

  elem = { $match: { _id: fetchParameters.courseId } };
  array.push(elem);

  elem = { $addFields: { 'units.Units.currentCourseId': '$_id' } };
  array.push(elem);

  elem = { $replaceRoot: { newRoot: '$units' } };
  array.push(elem);
  elem = { $unwind: '$Units' };
  array.push(elem);
  if (fetchParameters.unitId) {
    elem = { $match: { 'Units._id': fetchParameters.unitId } };
    array.push(elem);
  }
  array.push(
    {
      $lookup: {
        from: 'exam_attempt',
        localField: 'Units._id',
        foreignField: 'unit_id',
        as: 'exam_attempt'
      }
    },
    {
      $project: {
        attempt_today: {
          $filter: {
            input: '$exam_attempt',
            cond: [
              {
                $and: [{ $eq: ['$$this.user_id', userId] }]
              }
            ]
          }
        },
        user_attempted: {
          $filter: {
            input: '$exam_attempt',
            cond: { $eq: ['$$this.user_id', userId] }
          }
        },
        index: '$Units.index',
        title: '$Units.title',
        attempts_allowed_per_day: '$Units.attempts_allowed_per_day',
        headline: '$Units.headline',
        _id: '$Units._id',
        currentCourseId: '$Units.currentCourseId',
        sections_list: '$Units.sections.Sections'
      }
    },
    {
      $project: {
        count_exam: { $size: '$attempt_today' },
        attempts_allowed_per_day: 1,
        _id: '$_id',
        user_attempted: 1,
        index: 1,
        title: 1,
        headline: 1,
        currentCourseId: 1,
        sections_list: 1
      }
    }
  );
  elem = {
    $project: {
      attempts_left: {
        $subtract: ['$attempts_allowed_per_day', '$count_exam']
      },
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
      currentCourseId: 1,
      user_attempted: 1,
      sections_list: 1
    }
  };
  array.push(elem);

  elem = {
    $project: {
      title: projectionWriter.writeIntlStringEval('title', viewerLocale),
      headline: projectionWriter.writeIntlStringEval('headline', viewerLocale),
      attempts_allowed_per_day: 1,
      _id: 1,
      index: 1,
      user_attempted: 1,
      currentCourseId: 1,
      attempts_left: 1,
      sections_list: 1
    }
  };
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

  let result = await Course.aggregate(array).exec();
  return result;
};

export const fetchCourseUnits = async (
  filterValues,
  aggregateArray,
  viewerLocale,
  fetchParameters
) => {
  logger.debug(`in fetchCourseUnits`);

  let arrayRet = await fetchCourseUnitsBase(
    filterValues,
    aggregateArray,
    viewerLocale,
    fetchParameters
  );

  const userId = fetchParameters.userId;

  let userData = await UserFetch.findById(userId);
  for (let unitElem of arrayRet) {
    unitElem.ema = 0.0;
    unitElem.quiz_lvl = 0;
    unitElem.attempts_left = 0;
    unitElem.is_continue_exam = false;
    unitElem.exam_ = '';
    let has_quiz = false;
    let sectionArray = [];
    if (unitElem.sections_list) {
      sectionArray = unitElem.sections_list.sort(
        (it1, it2) => (it1.index || 0) - (it2.index || 0)
      );
    }
    if (sectionArray.length > 0) {
      for (let sectionElem of sectionArray) {
        sectionElem.ema = 0.0;
        sectionElem.title = getStringByLocale(
          sectionElem.title,
          viewerLocale
        ).text;
        sectionElem.headline = getStringByLocale(
          sectionElem.headline,
          viewerLocale
        ).text;
        let cardArray = [];
        if (sectionElem.cards.Cards) {
          cardArray = sectionElem.cards.Cards.sort(
            (it1, it2) => (it1.index || 0) - (it2.index || 0)
          );
        }
        sectionElem.cards_list = cardArray;
        if (cardArray.length > 0) {
          for (let card of cardArray) {
            card.title = getStringByLocale(card.title, viewerLocale).text;
            card.headline = getStringByLocale(card.headline, viewerLocale).text;
            const ema = await computeCardEMA(userId, card.question_ids);
            has_quiz = has_quiz || ema !== null;
            card.ema = ema ? ema : 0;
            sectionElem.ema += card.ema;
          }
          sectionElem.ema = sectionElem.ema / cardArray.length;
        }
        unitElem.ema += sectionElem.ema;
      }
      unitElem.ema = unitElem.ema / sectionArray.length;
    }

    const userattempted = unitElem.user_attempted || [];
    unitElem.unit_processing = has_quiz ? 0 : -1;
    unitElem.grade = 0;
    if (userattempted.length > 0) {
      unitElem.unit_processing = 0;
      try {
        const unitexam = await ExamFetch.findById(userattempted[0].exam_id);
        const unitGrade = Math.max(
          ...userattempted.map(item => item.final_grade_pct || 0)
        );
        // Assuming that all attempts for the Unit's exam were for the same exam_id
        unitElem.grade = unitGrade;
        unitElem.unit_processing = unitGrade >= unitexam.pass_mark_pct;
      } catch (err) {
        return Promise.reject(err);
      }
    }
    let arrayCourseRole = userData.course_roles;
    for (let courserole of arrayCourseRole) {
      if (
        courserole.course_unit_status ||
        courserole.course_unit_status.length > 0
      ) {
        let arrayCourseUnitStatus = courserole.course_unit_status;
        for (let unitStatus of arrayCourseUnitStatus) {
          if (unitStatus.unit_id === unitElem._id) {
            unitElem.quiz_lvl = unitStatus.quiz_lvl;
          }
        }
      }
    }
    let arrayAttemp = await ExamAttempt.find({
      started_at: {
        $gte: moment().format('YYYY-MM-DD 00:00:00'),
        $lte: moment().format('YYYY-MM-DD HH:mm:ss')
      },
      unit_id: { $eq: unitElem._id }
    }).exec();
    if (arrayAttemp.length > 0) {
      unitElem.attempts_left =
        unitElem.attempts_allowed_per_day - arrayAttemp.length;
    } else {
      unitElem.attempts_left = unitElem.attempts_allowed_per_day;
    }
    let lastCancelled = await fetchLastCancelledExamAttempt(
      userId,
      unitElem._id
    );
    if (lastCancelled && lastCancelled.isContinue === true) {
      unitElem.is_continue_exam = true;
      unitElem.exam_ = lastCancelled._id;
    }
  }
  return arrayRet;
};

export const fetchUserCourseUnitExamStatus = async (
  filterValues,
  aggregateArray,
  viewerLocale,
  fetchParameters
) => {
  logger.debug(`in fetchUserCourseUnitExamStatus`);
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

  const attemptSort = { submitted_at: -1, started_at: -1 };
  for (let unit of result) {
    let examAttempts = [];
    try {
      examAttempts = await ExamAttemptFetch.fetchExamAttemptByUserAndUnit(
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

    if (examAttempts.length > 0) {
      const latestAttempt = examAttempts[0];
      unit.last_attempted_at =
        latestAttempt.submitted_at || latestAttempt.started_at;

      const today = new Date().toDateString();
      unit.attempts = examAttempts.filter(
        item =>
          item.started_at.toDateString() === today ||
          (item.submitted_at && item.submitted_at.toDateString() === today)
      ).length;

      unit.attempts_left = unit.attempts_allowed_per_day - unit.attempts;
      if (unit.attempts_left < 0) {
        unit.attempts_left = 0;
      }

      unit.grade = Math.max(
        ...examAttempts.map(item => item.final_grade_pct || 0)
      );
      // Assuming that all attempts for the Unit's exam were for the same exam_id
      unit.passed = unit.grade >= latestAttempt.exam.pass_mark_pct;
    } else {
      unit.attempts = 0;
      unit.attempts_left = unit.attempts_allowed_per_day;
      unit.grade = 0;
      unit.passed = false;
    }
  }

  return result;
};

export const fetchUserCourseExamAttemptsByUnit = async (
  obj_id,
  viewer,
  info
) => {
  logger.debug(`in fetchUserCourseUnitExamAttempts`);
  const array = [
    {
      $match: {
        _id: obj_id
      }
    },
    {
      $project: {
        units: '$units.Units'
      }
    },
    {
      $unwind: '$units'
    },
    {
      $project: {
        'units._id': 1,
        'units.attempts_allowed_per_day': 1
      }
    },
    {
      $lookup: {
        from: 'exam_attempt',
        localField: 'units._id',
        foreignField: 'course_unit_id',
        as: 'exam_attempt'
      }
    },
    {
      $project: {
        exam_attempt: {
          $filter: {
            input: '$exam_attempt',
            cond: {
              $eq: ['$$this.user_id', viewer.user_id]
            }
          }
        },
        count_exam: {
          $size: '$exam_attempt'
        },
        'units.attempts_allowed_per_day': 1
      }
    },
    {
      $project: {
        total: {
          $subtract: ['$units.attempts_allowed_per_day', '$count_exam']
        }
      }
    }
  ];
  return await Course.aggregate(array).exec();
};

export const fetchCourseUnitById = async (
  unit_id,
  course_id,
  user_id,
  viewer
) => {
  logger.debug(`in fetchCourseUnitById`);
  let array = [];
  let elem;

  let viewerLocale = viewer.locale;

  let fetchParameters = {
    userId: user_id,
    courseId: course_id,
    unitId: unit_id
  };

  let arrayRet = await fetchCourseUnitsBase(
    null,
    null,
    viewerLocale,
    fetchParameters
  );

  for (let unitElem of arrayRet) {
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
    unitElem.ema = 0.0;
    unitElem.quiz_lvl = 0;
    unitElem.attempts_left = 0;
    let has_quiz = false;
    const userattempted = unitElem.user_attempted || [];
    unitElem.unit_processing = has_quiz ? 0 : -1;
    unitElem.grade = 0;
    let arrayAttemp = await ExamAttempt.find({
      started_at: {
        $gte: moment().format('YYYY-MM-DD 00:00:00'),
        $lte: moment().format('YYYY-MM-DD HH:mm:ss')
      },
      unit_id: { $eq: unitElem._id }
    }).exec();
    if (arrayAttemp.length > 0) {
      unitElem.attempts_left =
        unitElem.attempts_allowed_per_day - arrayAttemp.length;
    } else {
      unitElem.attempts_left = unitElem.attempts_allowed_per_day;
    }
  }
  return arrayRet[0];
};

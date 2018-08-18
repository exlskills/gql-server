import Course from '../../db-models/course-model';
import * as projectionWriter from '../../utils/projection-writer';
import moment from 'moment';
import { getStringByLocale } from '../../parsers/intl-string-parser';
import ExamAttempt from '../../db-models/exam-attempt-model';

export const fetchUnit = async (unit_id, course_id, user_id, viewer) => {
  console.log(`in fetchUnit`);
  let array = [];
  let elem;

  const userId = user_id;
  let viewerLocale = viewer.locale;
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
  let arrayRet = await Course.aggregate(array).exec();
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

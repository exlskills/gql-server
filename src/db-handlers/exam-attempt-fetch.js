import { basicFind } from '../db-handlers/basic-query-handler';
import ExamAttempt from '../db-models/exam-attempt-model.js';
import QuestionInteraction from '../db-models/question-interaction-model';
import { logger } from '../utils/logger';

export const findById = async (obj_id, viewer, info) => {
  logger.debug(`in Exam Attempt findById`);
  logger.debug(`  obj_id ` + obj_id);
  let record;
  try {
    //model, runParams, queryVal, sortVal, selectVal
    record = await basicFind(ExamAttempt, { isById: true }, obj_id);
  } catch (errInternalAllreadyReported) {
    return null;
  }
  return record;
};

export const fetchExamAttemptsByUserAndUnitJoinExam = async (
  user_id,
  unit_id,
  opts = {}
) => {
  logger.debug(`in fetchExamAttemptsByUserAndUnitJoinExam`);
  logger.debug(`   user_id ` + user_id);
  logger.debug(`   unit_id ` + unit_id);
  logger.debug(`   opts ` + JSON.stringify(opts));
  try {
    const sortVal = opts.sort;
    if (!opts.includeExam) {
      return await basicFind(ExamAttempt, null, { user_id, unit_id }, sortVal);
    }

    let array = [
      { $match: { user_id, unit_id } },
      {
        $lookup: {
          from: 'exam',
          localField: 'exam_id',
          foreignField: '_id',
          as: 'exam'
        }
      },
      { $unwind: '$exam' },
      { $sort: sortVal || {} }
    ];
    return await ExamAttempt.aggregate(array).exec();
  } catch (error) {
    return [];
  }
};

export const computeFinalGrade = async quesInteIds => {
  logger.debug(`in computeFinalGrade`);
  const result = await QuestionInteraction.aggregate([
    { $match: { _id: { $in: quesInteIds } } }
  ]).exec();
  let sumOfSoc = 0;
  for (let res of result) {
    if (res.pct_score == null || res.pct_score === '' || isNaN(res.pct_score)) {
      res.pct_score = 0;
    }
    sumOfSoc += res.pct_score;
  }
  return sumOfSoc;
};

export const fetchLastCancExamAttemptByUserUnit = async (user_id, unit_id) => {
  logger.debug(`in fetchLastCancExamAttemptByUserUnit`);
  logger.debug(`user_id ` + user_id);
  logger.debug(`unit_id ` + unit_id);
  let array = [];
  array.push({
    $match: {
      unit_id,
      user_id,
      is_active: false,
      is_cancelled: true
    }
  });
  array.push(
    {
      $lookup: {
        from: 'exam',
        localField: 'exam_id',
        foreignField: '_id',
        as: 'exam'
      }
    },
    { $unwind: '$exam' },
    {
      $project: {
        started_at: 1,
        submitted_at: 1,
        time_limit: '$exam.time_limit',
        updated_at: 1,
        is_active: 1,
        exam_id: 1
      }
    },
    { $sort: { started_at: -1 } },
    { $limit: 1 }
  );
  const arrayRet = await ExamAttempt.aggregate(array).exec();
  const record = arrayRet && arrayRet[0] ? arrayRet[0] : null;

  if (record) {
    const time_limit = record.time_limit * 60;
    const spent_time = (record.submitted_at - record.started_at) / 1000;
    record.isContinue = spent_time < time_limit;
    if (!record.isContinue) {
      ExamAttempt.update({ _id: record._id }, { is_active: false });
    }
  }
  logger.debug(
    `fetchLastCancelledExamAttempt result ` + JSON.stringify(record)
  );
  return record;
};

export const checkUserTookThisExam = async (exam_id, user_id, unit_id) => {
  logger.debug(`in checkUserTookThisExam`);
  let array = [];
  let elem;
  if (exam_id) {
    elem = { $match: { exam_id: exam_id, unit_id: unit_id, user_id: user_id } };
  } else {
    elem = { $match: { unit_id: unit_id, user_id: user_id } };
  }
  array.push(elem);
  const response = await ExamAttempt.aggregate(array).exec();
  return response.length > 0;
};

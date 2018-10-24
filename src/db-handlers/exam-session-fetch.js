import { basicFind } from '../db-handlers/basic-query-handler';
import ExamSession from '../db-models/exam-session-model.js';
import { logger } from '../utils/logger';
import moment from 'moment';

export const fetchById = async (obj_id, selectVal, viewer, info) => {
  logger.debug(`in Exam Session fetchById`);
  try {
    //model, runParams, queryVal, sortVal, selectVal
    return await basicFind(
      ExamSession,
      { isById: true },
      obj_id,
      null,
      selectVal
    );
  } catch (errInternalAlreadyReported) {
    return null;
  }
};

export const fetchExamSessionsByUserAndUnitToday = async (user_id, unit_id) => {
  logger.debug(`in fetchExamSessionsByUserAndUnitToday`);
  try {
    return await basicFind(
      ExamSession,
      null,
      {
        started_at: {
          $gte: moment()
            .utc()
            .startOf('day')
            .toDate(),
          $lte: moment()
            .utc()
            .toDate()
        },
        user_id: user_id,
        unit_id: unit_id
      },
      { started_at: -1 },
      { _id: 1 }
    );
  } catch (errInternalAlreadyReported) {
    return null;
  }
};

export const fetchExamSessionsByUserAndUnitJoinExam = async (
  user_id,
  unit_id,
  opts = {}
) => {
  logger.debug(`in fetchExamSessionsByUserAndUnitJoinExam`);
  logger.debug(`   user_id ` + user_id);
  logger.debug(`   unit_id ` + unit_id);
  logger.debug(`   opts ` + JSON.stringify(opts));
  try {
    const sortVal = opts.sort;
    if (!opts.includeExam) {
      return await basicFind(
        ExamSession,
        null,
        { user_id: user_id, unit_id: unit_id },
        sortVal
      );
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
    return await ExamSession.aggregate(array).exec();
  } catch (error) {
    return [];
  }
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
  elem = { $project: { exam_id: 1 } };
  array.push(elem);
  const response = await ExamSession.aggregate(array).exec();
  return response.length > 0;
};

export const findActiveExamSessionsForUser = async (user_id, selectVal) => {
  logger.debug(`in findActiveExamSessionsForUser`);
  logger.debug(`user_id ` + user_id);

  try {
    //model, runParams, queryVal, sortVal, selectVal
    return await basicFind(
      ExamSession,
      null,
      { user_id: user_id, is_active: true },
      null,
      selectVal
    );
  } catch (errInternalAlreadyReported) {
    return null;
  }
};

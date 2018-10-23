import { basicFind } from '../db-handlers/basic-query-handler';
import QuestionInteraction from '../db-models/question-interaction-model.js';
import { logger } from '../utils/logger';
import Config from '../config';
import ExamSession from '../db-models/exam-session-model';
import mongoose from 'mongoose';

export const fetchById = async (obj_id, selectVal, viewer, info) => {
  logger.debug(`in Quest Interact fetchById`);
  try {
    //model, runParams, queryVal, sortVal, selectVal
    return await basicFind(
      QuestionInteraction,
      { isById: true },
      obj_id,
      null,
      selectVal
    );
  } catch (errInternalAlreadyReported) {
    return null;
  }
};

export const fetchOneByIds = async (queryVal, selectVal, viewer, info) => {
  logger.debug(`in Quest Interact fetchById`);
  try {
    //model, runParams, queryVal, sortVal, selectVal
    return await basicFind(
      QuestionInteraction,
      { isOne: true },
      queryVal,
      null,
      selectVal
    );
  } catch (errInternalAlreadyReported) {
    return null;
  }
};

export const findByQuestionIds = async (
  userId,
  quesIds,
  type = null,
  opts = {}
) => {
  logger.debug(`in Quest Interact findByQuestionIds`);
  try {
    let conditions = { user_id: userId, question_id: { $in: quesIds } };
    if (type) {
      conditions.exam_type = type;
    }
    if (!opts.includeEmpty) {
      conditions.response_data = { $exists: true, $ne: null };
    }

    let query = QuestionInteraction.find(conditions);
    if (opts.sort) {
      query = query.sort(opts.sort);
    }
    if (opts.limit) {
      query = query.limit(opts.limit);
    }

    const result = await query.exec();
    logger.debug(`    result ` + JSON.stringify(result));
    return result;
  } catch (error) {
    return [];
  }
};

export const getUserAnswer = async (exam_session_id, question_id, user_id) => {
  logger.debug(`in Quest Interact getUserAnswer`);
  const record = await basicFind(
    QuestionInteraction,
    { isOne: true },
    {
      user_id: user_id,
      question_id: question_id,
      exam_session_id: exam_session_id
    }
  );
  return record && record.response_data ? record.response_data : null;
};

export const computeQuestionsEMA = async (userId, questionIds) => {
  logger.debug(`in computeQuestionsEMA`);
  const N = Config.card_ema.n;
  const K = 2 / (N + 1);
  let quesInters = [];

  try {
    quesInters = await findByQuestionIds(userId, questionIds, null, {
      sort: { updated_at: -1 },
      limit: N
    });
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
    let currEma = sumQuesInters / quesInters.length;
    for (let score of arrayScores) {
      currEma = (score - currEma) * K + currEma;
    }
    logger.debug(`  result EMA: ` + currEma);
    return currEma;
  }

  return null;
};

export const fetchCurrentAnswer = async (
  exam_session_id,
  question_id,
  user_id
) => {
  logger.debug(`in Question Interact fetchCurrentAnswer`);
  try {
    let array = [
      {
        $match: {
          exam_session_id: mongoose.Types.ObjectId(exam_session_id),
          user_id: user_id,
          question_id: question_id
        }
      },
      {
        $project: {
          answer_submissions: 1
        }
      },
      {
        $unwind: '$answer_submissions'
      },
      {
        $project: {
          _id: 0,
          submitted_at: '$answer_submissions.submitted_at',
          response_data: '$answer_submissions.response_data'
        }
      },
      {
        $sort: {
          submitted_at: -1
        }
      },
      { $limit: 1 }
    ];
    const qiRecord = await QuestionInteraction.aggregate(array).exec();
    logger.debug(`   qiRecord ` + JSON.stringify(qiRecord));

    return qiRecord ? qiRecord[0] : null;
  } catch (err) {
    logger.error(`Aggregation failed in fetchCurrentAnswer: ` + err);
    return null;
  }
};

export const fetchFinalAnswerJoinQuestion = async (
  exam_session_id,
  question_id,
  user_id
) => {
  logger.debug(`in Question Interact fetchFinalAnswerJoinQuestion`);
  try {
    let elem;
    let array = [];
    elem = {
      $match: {
        exam_session_id: mongoose.Types.ObjectId(exam_session_id),
        user_id: user_id,
        question_id: question_id
      }
    };
    array.push(elem);

    elem = {
      $project: {
        _id: 0,
        question_id: 1,
        answer_submissions: 1
      }
    };
    array.push(elem);
    elem = {
      $unwind: '$answer_submissions'
    };
    array.push(elem);
    elem = {
      $project: {
        submitted_at: '$answer_submissions.submitted_at',
        response_data: '$answer_submissions.response_data',
        question_id: 1
      }
    };
    array.push(elem);
    elem = {
      $sort: {
        submitted_at: -1
      }
    };
    array.push(elem);
    elem = { $limit: 1 };
    array.push(elem);

    let array_lookup = [];
    elem = {
      $match: {
        $expr: {
          $eq: ['$_id', '$$question_id']
        }
      }
    };
    array_lookup.push(elem);

    elem = {
      $project: {
        data: 1,
        points: 1,
        question_type: 1
      }
    };
    array_lookup.push(elem);

    elem = {
      $lookup: {
        from: 'question',
        let: { question_id: '$question_id' },
        pipeline: array_lookup,
        as: 'question'
      }
    };
    array.push(elem);
    elem = {
      $unwind: '$question'
    };
    array.push(elem);

    const qiRecord = await QuestionInteraction.aggregate(array).exec();
    logger.debug(`   qiRecord ` + JSON.stringify(qiRecord));

    return qiRecord ? qiRecord[0] : null;
  } catch (err) {
    logger.error(`Aggregation failed in fetchCurrentAnswer: ` + err);
    return null;
  }
};

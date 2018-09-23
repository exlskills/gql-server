import { basicFind } from '../db-handlers/basic-query-handler';
import QuestionInteraction from '../db-models/question-interaction-model.js';
import { logger } from '../utils/logger';
import Config from '../config';

export const fetchById = async (obj_id, selectVal, viewer, info) => {
  logger.debug(`in Quest Interact fetchById`);
  let record;
  try {
    //model, runParams, queryVal, sortVal, selectVal
    record = await basicFind(
      QuestionInteraction,
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

export const getUserAnswer = async (exam_attempt_id, question_id, user_id) => {
  logger.debug(`in Quest Interact getUserAnswer`);
  const record = await basicFind(
    QuestionInteraction,
    { isOne: true },
    {
      user_id: user_id,
      question_id: question_id,
      exam_attempt_id: exam_attempt_id
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

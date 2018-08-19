import QuestionInteraction from '../db-models/question-interaction-model';
import { logger } from '../utils/logger';

export const upsertQuestionInteraction = async object => {
  logger.debug(`in upsertQuestionInteraction`);
  try {
    const result = await QuestionInteraction.update(
      {
        user_id: object.user_id,
        question_id: object.question_id,
        exam_attempt_id: object.exam_attempt_id
      },
      object,
      { upsert: true }
    ).exec();

    const record = await QuestionInteraction.findOne({
      user_id: object.user_id,
      question_id: object.question_id,
      exam_attempt_id: object.exam_attempt_id
    }).exec();

    return { result, record };
  } catch (err) {
    return Promise.reject('Error adding QuestionInteraction to DB');
  }
};

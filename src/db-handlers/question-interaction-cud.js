import QuestionInteraction from '../db-models/question-interaction-model';
import * as QuestionInteractionFetch from '../db-handlers/question-interaction-fetch';
import { logger } from '../utils/logger';

export const upsertQuestionInteraction = async object => {
  logger.debug(`in upsertQuestionInteraction`);
  try {
    const result = await QuestionInteraction.updateOne(
      {
        user_id: object.user_id,
        question_id: object.question_id,
        exam_session_id: object.exam_session_id
      },
      object,
      { upsert: true }
    ).exec();

    const record = await QuestionInteraction.findOne({
      user_id: object.user_id,
      question_id: object.question_id,
      exam_session_id: object.exam_session_id
    }).exec();

    logger.debug(`upsertQuestionInteraction record ` + JSON.stringify(record));

    return { result, record };
  } catch (err) {
    return Promise.reject('Error adding QuestionInteraction to DB ' + err);
  }
};

export const processExamQuestionInteraction = async (
  user_id,
  question_id,
  exam_session_id,
  submitted_at,
  response_data,
  questionInteractionObjFields
) => {
  logger.debug(`in processExamQuestionInteraction`);
  const record = await QuestionInteractionFetch.fetchOneByIds(
    {
      user_id: user_id,
      question_id: question_id,
      exam_session_id: exam_session_id
    },
    { _id: 1 }
  );

  if (record && record._id) {
    try {
      const result = await QuestionInteraction.updateOne(
        {
          _id: record._id
        },
        {
          $push: {
            answer_submissions: {
              submitted_at: submitted_at,
              response_data: response_data
            }
          }
        }
      ).exec();
      return record._id;
    } catch (err) {
      logger.error(`Error updating QuestionInteraction ` + err);
      return null;
    }
  } else {
    try {
      const doc = {
        user_id: user_id,
        question_id: question_id,
        exam_session_id: exam_session_id,
        answer_submissions: {
          submitted_at: submitted_at,
          response_data: response_data
        },
        ...questionInteractionObjFields
      };
      const newRecord = await QuestionInteraction.create(doc);
      return newRecord._id;
    } catch (err) {
      logger.error(`Error creating QuestionInteraction record ` + err);
      return null;
    }
  }
};

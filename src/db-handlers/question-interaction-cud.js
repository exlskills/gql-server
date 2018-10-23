import QuestionInteraction from '../db-models/question-interaction-model';
import * as QuestionInteractionFetch from '../db-handlers/question-interaction-fetch';
import { logger } from '../utils/logger';

export const processExamQuestionInteraction = async (
  user_id,
  question_id,
  exam_session_id,
  submitted_at,
  response_data,
  questionInteractionObjFields
) => {
  logger.debug(`in processExamQuestionInteraction`);

  const docPayloadObj = { ...questionInteractionObjFields };

  const record = await QuestionInteractionFetch.fetchOneByIds(
    {
      user_id: user_id,
      question_id: question_id,
      exam_session_id: exam_session_id
    },
    {
      _id: 1,
      result: 1
    }
  );

  if (record && record._id) {
    if (response_data) {
      docPayloadObj.$push = {
        answer_submissions: {
          submitted_at: submitted_at,
          response_data: response_data
        }
      };
    }
    if (JSON.stringify(docPayloadObj) !== '{}') {
      try {
        await QuestionInteraction.updateOne(
          {
            _id: record._id
          },
          docPayloadObj
        ).exec();
      } catch (err) {
        logger.error(`Error updating QuestionInteraction ` + err);
        return null;
      }
    }
    return record._id;
  } else {
    if (response_data) {
      docPayloadObj.answer_submissions = {
        submitted_at: submitted_at,
        response_data: response_data
      };
    }

    if (!docPayloadObj.result) {
      docPayloadObj.result = 'auto_generated';
    }

    let newRecord = { _id: null };
    try {
      const doc = {
        user_id: user_id,
        question_id: question_id,
        exam_session_id: exam_session_id,
        ...docPayloadObj
      };
      newRecord = await QuestionInteraction.create(doc);
    } catch (err) {
      logger.error(`Error creating QuestionInteraction record ` + err);
      return null;
    }
    return newRecord._id;
  }
};

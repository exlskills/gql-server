import QuestionInteraction from '../db-models/question-interaction-model';
import { logger } from '../utils/logger';
import { basicFind } from "./basic-query-handler";
import User from "../db-models/user-model";
import { mdbUserToGqlUser } from "../parsers/user-parser";

export const findByIds = async (user_id, viewer, info) => {
  logger.debug(`in findByIds`);
  let userRecord;
  try {
    //model, runParams, queryVal, sortVal, selectVal
    userRecord = await basicFind(User, { isById: true }, user_id);
  } catch (errInternalAlreadyReported) {
    return null;
  }

  try {
    userRecord = await mdbUserToGqlUser(userRecord, viewer);
  } catch (errInternalAlreadyReported) {
    return null;
  }

  return userRecord;
};

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

export const processExamQuestionInteraction = async object => {
  logger.debug(`in processExamQuestionInteraction`);
  try {

    const record = await QuestionInteraction.findOne({
      user_id: object.user_id,
      question_id: object.question_id,
      exam_session_id: object.exam_session_id
    }).exec();

    const result = await QuestionInteraction.updateOne(
      {
        user_id: object.user_id,
        question_id: object.question_id,
        exam_session_id: object.exam_session_id
      },
      object,
      { upsert: true }
    ).exec();



    logger.debug(`upsertQuestionInteraction record ` + JSON.stringify(record));

    return { result, record };
  } catch (err) {
    return Promise.reject('Error adding QuestionInteraction to DB ' + err);
  }
};
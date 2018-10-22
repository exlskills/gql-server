import ExamSession from '../db-models/exam-session-model';
import { logger } from '../utils/logger';
import { stringify } from 'flatted/cjs';
import mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

export const createExamSessionDoc = async sessionObj => {
  logger.debug(`in createExamAttempt`);
  try {
    const record = await ExamSession.create(sessionObj);
    return record._id;
  } catch (err) {
    logger.error(
      `Create ExamSession doc failed with error: ` +
        err +
        ` ; Doc object: ` +
        stringify(sessionObj)
    );
    return null;
  }
};

export const updateExamSession = async (condition, object, opts = {}) => {
  logger.debug(`in updateExamSession`);
  try {
    const result = await ExamSession.updateOne(condition, object).exec();
    // {"n":1,"nModified":1,"ok":1}
    let record;
    if (opts && opts.returnRecords === true) {
      record = await ExamSession.findOne(condition).exec();
    }
    return { result, record };
  } catch (err) {
    logger.error(
      `Update ExamSession doc failed with error: ` +
        err +
        ` ; Doc object: ` +
        stringify(sessionObj)
    );
    return null;
  }
};

export const recordQuestionInteractionId = async (
  exam_session_id,
  questionInteraction_id
) => {
  logger.debug(`in recordQuestionInteractionId`);
  try {
    let array = [
      { $match: { _id: ObjectId(exam_session_id) } },
      {
        $project: {
          qi_id_found: {
            $in: [ObjectId(questionInteraction_id), '$question_interaction_ids']
          }
        }
      }
    ];
    const checkExamSession = await ExamSession.aggregate(array).exec();
    logger.debug(`checkExamSession ` + JSON.stringify(checkExamSession));
    if (checkExamSession[0].qi_id_found) {
      return { already_recorded: 1 };
    } else {
      return updateExamSession(
        { _id: exam_session_id },
        { $push: { question_interaction_ids: questionInteraction_id } }
      );
    }
  } catch (err) {
    logger.error(`recordQuestionInteractionId failed with error: ` + err);
    return null;
  }
};

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
        stringify(object)
    );
    return null;
  }
};

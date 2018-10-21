import ExamSession from '../db-models/exam-session-model';
import { logger } from '../utils/logger';
import { stringify } from 'flatted/cjs';

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

export const updateExamAttempt = async (condition, object, opts = {}) => {
  logger.debug(`in updateExamAttempt`);
  try {
    const result = await ExamSession.updateOne(condition, object).exec();
    let records;
    if (opts && opts.returnRecords === true) {
      records = await ExamSession.find(condition).exec();
    }

    return { result, records };
  } catch (err) {
    return Promise.reject('cannot update exam-attempt ' + err.message);
  }
};

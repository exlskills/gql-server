import ExamptAttempt from '../db-models/exam-attempt-model';
import { logger } from '../utils/logger';
import { stringify } from 'flatted/cjs';

export const createExamAttempt = async examObject => {
  logger.debug(`in createExamAttempt`);
  try {
    return await ExamptAttempt.create(examObject);
  } catch (err) {
    logger.error(
      `failed inserting ExamAttempt ` +
        err +
        ` for doc ` +
        stringify(examObject)
    );
    return null;
  }
};

export const updateExamAttempt = async (condition, object, opts = {}) => {
  logger.debug(`in updateExamAttempt`);
  try {
    const result = await ExamptAttempt.updateOne(condition, object).exec();
    let records;
    if (opts && opts.returnRecords === true) {
      records = await ExamptAttempt.find(condition).exec();
    }

    return { result, records };
  } catch (err) {
    return Promise.reject('cannot update exam-attempt ' + err.message);
  }
};

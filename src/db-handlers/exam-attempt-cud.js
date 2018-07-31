import ExamptAttempt from '../db-models/exam-attempt-model';

export const createExamAttempt = async examObject => {
  try {
    return await ExamptAttempt.create(examObject);
  } catch (err) {
    return Promise.reject('Error adding to DB' + err);
  }
  return false;
};

export const updateExamAttempt = async (condition, object, opts = {}) => {
  try {
    const result = await ExamptAttempt.update(condition, object).exec();
    let records;
    if (opts && opts.returnRecords == true) {
      records = await ExamptAttempt.find(condition).exec();
    }

    return { result, records };
  } catch (err) {
    return Promise.reject('cannot update exam-attempt ' + err.message);
  }
};

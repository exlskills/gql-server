import { findById, getOneExam } from '../db-handlers/exam-fetch';
import { fetchExamAttemptByUserAndUnit } from '../db-handlers/exam-attempt-fetch';
import { toGlobalId, fromGlobalId } from 'graphql-relay';
export const resolveExam = async (obj, args, viewer, info) => {
  try {
    let course_id = fromGlobalId(args.course_id).id;
    let unit_id = fromGlobalId(args.unit_id).id;
    let exam_id = await getOneExam(unit_id, course_id, viewer, info);
    return findById(exam_id, viewer, info);
  } catch (error) {
    return Promise.reject(error);
  }
};
export const resolveExamAttempt = async (obj, args, viewer, info) => {
  try {
    let unit_id = fromGlobalId(args.unit_id).id;
    return await fetchExamAttemptByUserAndUnit(viewer.user_id, unit_id);
  } catch (error) {
    return Promise.reject(error);
  }
};

import { createExamAttempt } from '../db-handlers/exam-attempt-cud';
import {
  pickExamId,
  examFetchById,
  getRandomQuestionIds
} from '../db-handlers/exam-fetch';
import { fetchById } from '../db-handlers/course/course-fetch';
import * as ExamAttemptFetch from '../db-handlers/exam-attempt-fetch';
import { createActivity } from '../db-handlers/activities-cud';
import { getStringByLocale } from '../parsers/intl-string-parser';
import { toClientUrlId } from '../utils/client-url';
import { logger } from '../utils/logger';
import { fetchByCourseAndUnitId } from '../db-handlers/course/course-unit-fetch';
import { fetchExamAttemptsByUserAndUnitToday } from '../db-handlers/exam-attempt-fetch';

export const startExam = async (courseId, unitId, viewer, info) => {
  logger.debug(`in startExam`);
  try {
    let unitObj = await fetchByCourseAndUnitId(courseId, unitId, {
      final_exams: '$Units.final_exams',
      attempts_allowed_per_day: '$Units.attempts_allowed_per_day'
    });

    if (!unitObj || !unitObj.final_exams || unitObj.final_exams.length < 1) {
      return {
        completionObj: { code: '1', msg: 'No Exams Found for Course-Unit' }
      };
    }

    const arrayAttempts = await fetchExamAttemptsByUserAndUnitToday(
      viewer.user_id,
      unitId
    );
    logger.debug(` arrayAttempts ` + JSON.stringify(arrayAttempts));
    if (arrayAttempts.length > 0) {
      const lastAttempt = arrayAttempts[0];
      // TODO check if current attempt still valid
      if (arrayAttempts.length >= unitObj.attempts_allowed_per_day) {
      }
    }

    let exam_id = await pickExamId(unitObj, viewer, info);
    if (!exam_id) {
      return {
        completionObj: { code: '1', msg: 'No Exams Found for Course-Unit' }
      };
    }

    let questIdsObj = await getRandomQuestionIds(exam_id);
    if (
      !questIdsObj ||
      !questIdsObj.quesIds ||
      questIdsObj.quesIds.length < 1
    ) {
      logger.error(
        `Failed to build Question ID Array for the exam ID ` + exam_id
      );
      return {
        completionObj: {
          code: '1',
          msg: 'Failed to build Question ID Array for the exam'
        }
      };
    }

    const attemptInsert = await createExamAttempt({
      exam_id: exam_id,
      user_id: viewer.user_id,
      unit_id: unitId,
      started_at: Date(),
      is_cancelled: false,
      is_active: true,
      question_ids: questIdsObj.quesIds
    });
    if (!attemptInsert) {
      return {
        completionObj: {
          code: '1',
          msg: 'Failed to insert Exam Attempt doc'
        }
      };
    }

    const course = await fetchById(courseId, { _id: 1, title: 1 });
    const courseTitle = getStringByLocale(course.title, viewer.locale).text;
    const courseUrlId = toClientUrlId(courseTitle, course._id);

    const activityInsert = await createActivity(viewer.user_id, {
      listDef_value: 'attempted_exam',
      activity_link: `/courses/${courseUrlId}/grades`,
      doc_ref: {
        EmbeddedDocRef: {
          embedded_doc_refs: [
            {
              level: 'course',
              doc_id: courseId
            },
            {
              level: 'unit',
              doc_id: unitId
            },
            {
              level: 'exam',
              doc_id: exam_id
            }
          ]
        }
      }
    });
    if (!activityInsert) {
      return {
        completionObj: {
          code: '1',
          msg: 'Failed to insert Activity doc'
        }
      };
    }

    const exam = await examFetchById(exam_id, { time_limit: 1 });
    const time_limit = exam.time_limit;

    return {
      exam_session_id: attemptInsert._id,
      exam_time_limit: time_limit,
      exam_id: exam_id,
      completionObj: {
        code: '0',
        msg: ''
      }
    };
  } catch (error) {
    return { completionObj: { code: '1', msg: error.message } };
  }
};

export const leaveExam = async (exam_attempt_id, cancel, viewer, info) => {
  logger.debug(`in leaveExam`);
  try {
    const examattempt = await ExamAttemptFetch.fetchById(exam_attempt_id, {
      _id: 1,
      exam_id: 1,
      started_at: 1
    });
    examattempt.submitted_at = new Date();
    examattempt.is_cancelled = cancel !== false;

    const exam = await ExamFetch.fetchById(examattempt.exam_id, {
      time_limit: 1
    });
    if (exam) {
      const timeDiff =
        (examattempt.submitted_at - examattempt.started_at) / 1000 / 60;
      examattempt.time_limit_exceeded = timeDiff > exam.time_limit;
      examattempt.is_active = false;
      await examattempt.save();
    }
    return {
      completionObj: {
        code: '0',
        msg: ''
      }
    };
  } catch (error) {
    return { completionObj: { code: '1', msg: error.message } };
  }
};

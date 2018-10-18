import { createExamAttempt } from '../db-handlers/exam-attempt-cud';
import { examFetchById } from '../db-handlers/exam-fetch';
import * as CourseFetch from '../db-handlers/course/course-fetch';
import * as ExamAttemptFetch from '../db-handlers/exam-attempt-fetch';
import { createActivity } from '../db-handlers/activities-cud';
import { getStringByLocale } from '../parsers/intl-string-parser';
import { toClientUrlId } from '../utils/client-url';
import { logger } from '../utils/logger';

export const takeExam = async (courseId, unitId, viewer, info) => {
  logger.debug(`in takeExam`);
  try {
    let arrayReturn = await ExamFetch.returnObjectExamAttempt(
      unitId,
      courseId,
      viewer,
      info
    );
    let attempt = await createExamAttempt({
      exam_id: arrayReturn.exam_id,
      user_id: viewer.user_id,
      unit_id: unitId,
      started_at: arrayReturn.started_at,
      is_cancelled: false,
      is_active: true,
      question_ids: arrayReturn.arrayQuestion
    });

    if (!attempt) {
      return { completionObj: { code: '1', msg: 'Invalid attempt' } };
    }
    const course = await CourseFetch.fetchById(courseId, { _id: 1, title: 1 });
    const courseTitle = getStringByLocale(course.title, viewer.locale).text;
    const courseUrlId = toClientUrlId(courseTitle, course._id);

    createActivity(viewer.user_id, {
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
              doc_id: arrayReturn.exam_id
            }
          ]
        }
      }
    });
    const exam = await examFetchById(attempt.exam_id, { time_limit: 1 });
    const time_limit = exam.time_limit;

    return {
      exam_attempt_id: attempt._id,
      exam_time_limit: time_limit,
      exam_id: attempt.exam_id,
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

    const exam = await examFetchById(examattempt.exam_id, {
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

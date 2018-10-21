import { createExamSessionDoc } from '../db-handlers/exam-session-cud';
import {
  pickExamId,
  examFetchById,
  getRandomQuestionIds
} from '../db-handlers/exam-fetch';
import { getCourseUrl } from '../db-handlers/course/course-fetch';
import * as ExamAttemptFetch from '../db-handlers/exam-session-fetch';
import { createActivity } from '../db-handlers/activities-cud';
import { logger } from '../utils/logger';
import { fetchByCourseAndUnitId } from '../db-handlers/course/course-unit-fetch';
import { fetchExamAttemptsByUserAndUnitToday } from '../db-handlers/exam-session-fetch';

export const startExam = async (courseId, unitId, viewer, info) => {
  logger.debug(`in startExam`);
  try {
    let unitObj = await fetchByCourseAndUnitId(courseId, unitId, {
      final_exams: '$Units.final_exams',
      attempts_allowed_per_day: '$Units.attempts_allowed_per_day'
    });

    if (!unitObj || !unitObj.final_exams || unitObj.final_exams.length < 1) {
      return {
        completionObj: {
          code: '1',
          msg: 'This Unit does not have exams',
          msg_id: 'noexam'
        }
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
        return {
          completionObj: {
            code: '1',
            msg: 'No more attempts allowed today for this Unit',
            msg_id: 'over_max_attempts'
          }
        };
      }
    }

    let exam_id = await pickExamId(unitObj, viewer, info);
    if (!exam_id) {
      return {
        completionObj: {
          code: '1',
          msg: 'No Exams found for this Unit',
          msg_id: 'no_exams_found'
        }
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
          msg: 'Failed to build Exam Question set',
          msg_id: 'fail_build_qs_set'
        }
      };
    }

    const sessionDocId = await createExamSessionDoc({
      exam_id: exam_id,
      user_id: viewer.user_id,
      unit_id: unitId,
      started_at: Date(),
      is_cancelled: false,
      is_active: true,
      question_ids: questIdsObj.quesIds
    });
    if (!sessionDocId) {
      return {
        completionObj: {
          code: '1',
          msg: 'Failed initiate Exam Session',
          msg_id: 'fail_exam_session_doc'
        }
      };
    }

    const courseUrlId = await getCourseUrl(courseId);

    await createActivity({
      date: new Date(),
      user_id: viewer.user_id,
      listdef_value: 'attempted_exam',
      activity_link: `/courses/${courseUrlId}/grades`,
      activity_link_ref: {
        course_id: courseId,
        unit_id: unitId,
        exam_session_id: sessionDocId
      }
    });
    // Still proceed with the exam if Activity insert failed

    const exam = await examFetchById(exam_id, { time_limit: 1 });
    const time_limit = exam.time_limit;

    return {
      exam_session_id: sessionDocId,
      exam_time_limit: time_limit,
      exam_id: exam_id,
      completionObj: {
        code: '0',
        msg: '',
        msg_id: ''
      }
    };
  } catch (error) {
    return {
      completionObj: {
        code: '1',
        msg: error.message,
        msg_id: 'srv_uncaught_error'
      }
    };
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

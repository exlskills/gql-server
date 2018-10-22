import { createExamSessionDoc } from '../db-handlers/exam-session-cud';
import {
  pickExamId,
  examFetchById,
  getRandomQuestionIds
} from '../db-handlers/exam-fetch';
import { getCourseUrl } from '../db-handlers/course/course-fetch';
import * as ExamSessionFetch from '../db-handlers/exam-session-fetch';
import { createActivity } from '../db-handlers/activities-cud';
import { logger } from '../utils/logger';
import { fetchByCourseAndUnitId } from '../db-handlers/course/course-unit-fetch';
import { fetchExamSessionsByUserAndUnitToday } from '../db-handlers/exam-session-fetch';
import { findActiveExamSessionsForUser } from '../db-handlers/exam-session-fetch';
import moment from 'moment';

export const startExam = async (courseId, unitId, viewer, info) => {
  logger.debug(`in startExam`);
  try {
    const activeSessions = await findActiveExamSessionsForUser(viewer.user_id, {
      _id: 1,
      exam_id: 1,
      unit_id: 1,
      started_at: 1
    });
    if (activeSessions && activeSessions.length > 0) {
      return {
        exam_session_id: activeSessions._id,
        exam_id: activeSessions.exam_id,
        completionObj: {
          code: '1',
          msg: 'Another exam session is already active',
          msg_id: 'active_session'
        }
      };
    }

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

    const arrayAttempts = await fetchExamSessionsByUserAndUnitToday(
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

    const courseUrlId = await getCourseUrl(courseId);
    const exam = await examFetchById(exam_id, { time_limit: 1 });
    // Everything is validated and ready at this point

    const started_at = moment()
      .utc()
      .toDate();
    // TODO - add a "grace period" based on the user connection speed
    const active_till = new Date(
      started_at.getTime() + exam.time_limit * 60000
    );

    const sessionDocId = await createExamSessionDoc({
      exam_id: exam_id,
      user_id: viewer.user_id,
      unit_id: unitId,
      started_at: started_at,
      active_till: active_till,
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

    // do not wait for this to finish
    createActivity({
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

    return {
      exam_session_id: sessionDocId,
      exam_time_limit: exam.time_limit,
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

export const leaveExam = async (exam_session_id, cancel, viewer, info) => {
  logger.debug(`in leaveExam`);
  try {
    const examSession = await ExamSessionFetch.fetchById(exam_session_id, {
      _id: 1,
      exam_id: 1,
      started_at: 1
    });
    examSession.submitted_at = new Date();
    examSession.is_cancelled = cancel !== false;

    const exam = await ExamFetch.fetchById(examSession.exam_id, {
      time_limit: 1
    });
    if (exam) {
      const timeDiff =
        (examSession.submitted_at - examSession.started_at) / 1000 / 60;
      examSession.time_limit_exceeded = timeDiff > exam.time_limit;
      examSession.is_active = false;
      await examSession.save();
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

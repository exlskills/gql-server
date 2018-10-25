import {
  createExamSessionDoc,
  updateExamSession
} from '../db-handlers/exam-session-cud';
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
import { recordIncident } from '../db-handlers/incidents-cud';
import {
  gradeMCQuestionAnswer,
  gradeWSCQQuestionAnswer
} from '../utils/question-answer-grading';
import { fetchFinalAnswerJoinQuestion } from '../db-handlers/question-interaction-fetch';
import { QUESTION_TYPES } from '../db-models/question-model';
import { processExamQuestionInteraction } from '../db-handlers/question-interaction-cud';

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

    const started_at = new Date();
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

export const processExamSubmission = async (exam_session_id, viewer, info) => {
  logger.debug(`in processExamSubmission`);

  const received_at = new Date();

  const examSession = await ExamSessionFetch.fetchById(exam_session_id, {
    user_id: 1,
    exam_id: 1,
    question_ids: 1,
    active_till: 1,
    final_grade_pct: 1
  });

  if (
    !examSession &&
    !examSession.question_ids &&
    examSession.question_ids.length < 1
  ) {
    return {
      completionObj: {
        code: '1',
        msg: 'Invalid exam session',
        msg_id: 'invalid_session'
      }
    };
  }

  if (examSession.user_id !== viewer.user_id) {
    //  Do not wait for this
    recordIncident(viewer.user_id, 'exam_session', 'session details mismatch');
    return {
      completionObj: {
        code: '1',
        msg: 'Invalid exam session',
        msg_id: 'invalid_session'
      }
    };
  }

  if (
    examSession.time_limit_exceeded ||
    (received_at && examSession.active_till < received_at)
  ) {
    return {
      completionObj: {
        code: '1',
        msg: 'Exam session expired',
        msg_id: 'session_expired'
      }
    };
  }

  const examRec = await examFetchById(examSession.exam_id, {
    _id: 0,
    pass_mark_pct: 1
  });
  logger.debug(`  examRec ` + JSON.stringify(examRec));

  if (!examSession.is_active) {
    return {
      final_grade_pct: examSession.final_grade_pct,
      pass_mark_pct: examRec.pass_mark_pct,
      completionObj: {
        code: '2',
        msg: 'Exam session comleted',
        msg_id: 'session_completed'
      }
    };
  }

  let sum_pct_score = 0;
  for (let question_id of examSession.question_ids) {
    let gradingObj = { pct_score: 0 };

    const qiRecord = await fetchFinalAnswerJoinQuestion(
      exam_session_id,
      question_id,
      viewer.user_id
    );
    try {
      if (qiRecord && qiRecord.response_data) {
        if (
          qiRecord.question.question_type ===
            QUESTION_TYPES.MULT_CHOICE_SINGLE_ANSWER ||
          qiRecord.question.question_type ===
            QUESTION_TYPES.MULT_CHOICE_MULT_ANSWERS
        ) {
          gradingObj = await gradeMCQuestionAnswer(
            qiRecord.question,
            qiRecord.response_data,
            viewer
          );
        } else if (
          qiRecord.question.question_type ===
          QUESTION_TYPES.WRITE_SOFTWARE_CODE_QUESTION
        ) {
          gradingObj = await gradeWSCQQuestionAnswer(
            qiRecord.question,
            qiRecord.response_data,
            viewer
          );
        } else {
          logger.error(
            'Grading logic not implemented for question type ' +
              qiRecord.question.question_type
          );
          return {
            completionObj: {
              code: '1',
              msg: 'Exam grading failed',
              msg_id: 'grading_issue'
            }
          };
        }
      }
    } catch (err) {
      logger.error(
        `Grade question failed exam_session_id: ` +
          exam_session_id +
          ` question_id ` +
          question_id
      );
      return {
        completionObj: {
          code: '1',
          msg: 'Exam grading failed',
          msg_id: 'grading_issue'
        }
      };
    }

    // Do not wait for this
    processExamQuestionInteraction(
      viewer.user_id,
      question_id,
      exam_session_id,
      received_at,
      null,
      {
        points: gradingObj.points,
        pct_score: gradingObj.pct_score
      }
    );

    sum_pct_score += gradingObj.pct_score;
  }

  const final_grade_pct = sum_pct_score / examSession.question_ids.length;
  logger.debug(`  final_grade_pct ` + final_grade_pct);

  // do not wait
  updateExamSession(
    { _id: exam_session_id },
    {
      is_active: false,
      submitted_at: received_at,
      time_limit_exceeded: false,
      final_grade_pct: final_grade_pct
    }
  );

  return {
    final_grade_pct: final_grade_pct,
    pass_mark_pct: examRec.pass_mark_pct,
    completionObj: {
      code: '0',
      msg: '',
      msg_id: ''
    }
  };
};

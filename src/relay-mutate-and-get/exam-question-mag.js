import { processExamQuestionInteraction } from '../db-handlers/question/question-interaction-cud';
import * as QuestionFetch from '../db-handlers/question/question-fetch';
import { logger } from '../utils/logger';
import * as ExamSessionFetch from '../db-handlers/exam-session-fetch';
import { recordIncident } from '../db-handlers/incidents-cud';
import * as QuestionInteractionFetch from '../db-handlers/question/question-interaction-fetch';

// Returns completionObj if verification fails, otherwise returns {}
export const verifyExamQuestionAnswerCall = async (
  question_id,
  exam_session_id,
  received_at,
  viewer
) => {
  logger.debug(`in verifyExamQuestionAnswerCall`);

  try {
    const question = await QuestionFetch.fetchById(question_id, {
      _id: 1,
      exam_only: 1,
      course_item_ref: 1
    });
    if (!question || !question.exam_only) {
      return {
        completionObj: {
          code: '1',
          msg: 'Invalid question',
          msg_id: 'invalid_q'
        }
      };
    }

    const examSession = await ExamSessionFetch.fetchById(exam_session_id, {
      unit_id: 1,
      exam_id: 1,
      user_id: 1,
      question_ids: 1,
      active_till: 1
    });

    if (!examSession) {
      return {
        completionObj: {
          code: '1',
          msg: 'Invalid exam session',
          msg_id: 'invalid_session'
        }
      };
    }

    if (
      examSession.user_id !== viewer.user_id ||
      examSession.unit_id !== question.course_item_ref.unit_id ||
      examSession.question_ids.filter(qid => qid === question_id).length < 1
    ) {
      //  Do not wait for this
      recordIncident(
        viewer.user_id,
        'exam_quest',
        'session or question details mismatch'
      );
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

    if (!examSession.is_active) {
      return {
        completionObj: {
          code: '1',
          msg: 'Exam session comleted',
          msg_id: 'session_completed'
        }
      };
    }

    return {};
  } catch (error) {
    logger.error(`In verifyExamQuestionAnswerCall ` + error);
    return {
      completionObj: {
        code: '1',
        msg: 'Processing failed',
        msg_id: 'process_failed'
      }
    };
  }
};

export const processExamQuestionAnswer = async (
  question_id,
  exam_session_id,
  response_data,
  viewer
) => {
  logger.debug(`in processExamQuestionAnswer`);
  logger.debug(`   question_id ` + question_id);
  logger.debug(`   exam_session_id ` + exam_session_id);
  logger.debug(`   response_data ` + response_data);

  const received_at = new Date();

  const verification = await verifyExamQuestionAnswerCall(
    question_id,
    exam_session_id,
    received_at,
    viewer
  );

  if (verification.completionObj) {
    return verification;
  }

  try {
    const questionInteraction_id = await processExamQuestionInteraction(
      viewer.user_id,
      question_id,
      exam_session_id,
      received_at,
      response_data,
      { result: 'answer_submitted' }
    );

    if (!questionInteraction_id) {
      return {
        completionObj: {
          code: '1',
          msg: 'Processing failed',
          msg_id: 'process_failed'
        }
      };
    }

    return {
      completionObj: {
        code: '0',
        msg: 'Answer recorded',
        msg_id: 'answer_recorded'
      }
    };
  } catch (error) {
    logger.error(`In processExamQuestionAnswer ` + error);
    return {
      completionObj: {
        code: '1',
        msg: 'Processing failed',
        msg_id: 'process_failed'
      }
    };
  }
};

export const getCurrentExamQuestionAnswer = async (
  question_id,
  exam_session_id,
  viewer
) => {
  logger.debug(`in getCurrentExamQuestionAnswer`);
  logger.debug(`   question_id ` + question_id);
  logger.debug(`   exam_session_id ` + exam_session_id);

  const verification = await verifyExamQuestionAnswerCall(
    question_id,
    exam_session_id,
    null,
    viewer
  );
  if (verification.completionObj) {
    return verification;
  }

  try {
    const qiRecord = await QuestionInteractionFetch.fetchCurrentAnswer(
      exam_session_id,
      question_id,
      viewer.user_id
    );

    if (!qiRecord) {
      return {
        completionObj: {
          code: '2',
          msg: 'Not found',
          msg_id: 'not_found'
        }
      };
    }
    return {
      ...qiRecord,
      completionObj: {
        code: '0',
        msg: '',
        msg_id: ''
      }
    };
  } catch (error) {
    logger.error(`In getCurrentExamQuestionAnswer ` + error);
    return {
      completionObj: {
        code: '1',
        msg: 'Processing failed',
        msg_id: 'process_failed'
      }
    };
  }
};

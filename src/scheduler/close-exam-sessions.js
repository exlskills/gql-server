import { fetchByKey } from '../db-handlers/user/user-fetch';
import { logger } from '../utils/logger';
import { getExpiredExamSessionsToClose } from '../db-handlers/exam-session-fetch';
import * as ExamSessionFetch from '../db-handlers/exam-session-fetch';
import { updateExamSession } from '../db-handlers/exam-session-cud';
import { gradeExamSession } from '../relay-mutate-and-get/exam-session-mag';

export const processCloseExamSession = async session_id_from_job => {
  let session_ids = [session_id_from_job];
  for (let cycle = 0; cycle < 2; cycle++) {
    logger.debug(`in closeExamSession. Cycle ` + cycle);
    if (cycle === 1) {
      session_ids = await getExpiredExamSessionsToClose();
    }
    logger.debug(`   session_ids ` + JSON.stringify(session_ids));
    if (!session_ids) continue;
    for (let session_id of session_ids) {
      const examSession = await ExamSessionFetch.fetchById(session_id, {
        _id: 1,
        user_id: 1,
        exam_id: 1,
        question_ids: 1,
        active_till: 1,
        is_being_graded: 1,
        grading_failed: 1
      });
      if (
        !examSession ||
        examSession.is_being_graded ||
        examSession.grading_failed ||
        examSession.active_till > new Date()
      ) {
        logger.debug(`   skipping session ` + session_id);
        continue;
      }

      await updateExamSession(
        { _id: examSession._id },
        {
          is_active: false,
          time_limit_exceeded: true
        }
      );

      const userData = await fetchByKey(
        { _id: examSession.user_id },
        { primary_locale: 1 }
      );
      logger.debug(`userData ` + JSON.stringify(userData));

      if (!userData) {
        logger.error(`user record not found for id ` + examSession.user_id);
        await updateExamSession(
          { _id: examSession._id },
          {
            is_being_graded: false,
            grading_failed: true,
            final_grade_pct: 0
          }
        );
        continue;
      }

      try {
        await gradeExamSession(examSession, {
          user_id: examSession.user_id,
          locale: userData.primary_locale
        });
      } catch (alreadyRecorded) {}
    }
  }
};

import { logger } from '../utils/logger';
import CourseBadgeIssue from '../db-models/course-badge-issue-model';
import { basicFind } from '../db-handlers/basic-query-handler';

export const fetchByUserCourseBatchType = async (
  user_id,
  course_id,
  badge_type,
  viewer,
  info
) => {
  logger.debug(`in CourseBadgeIssue fetchByUserCourseBatchType`);

  let record;
  try {
    // Returns an array (expecting zero or 1 element)
    record = await basicFind(
      CourseBadgeIssue,
      null,
      { user_id: user_id, course_id: course_id, badge_type: badge_type },
      { score: 1, date_issued: 1 }
    );
  } catch (errInternalAlreadyReported) {
    return null;
  }
  return record;
};

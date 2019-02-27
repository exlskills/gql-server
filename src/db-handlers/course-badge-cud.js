import { stringify } from 'flatted/cjs';
import { logger } from '../utils/logger';
import CourseBadgeIssue from '../db-models/course-badge-issue-model';

export const createUserCourseBadge = async (
  course_id,
  user_id,
  badge_type,
  score,
  date_issued
) => {
  logger.debug(`in createUserCourseBadge`);
  const newCourseBadgeObj = {
    course_id: course_id,
    user_id: user_id,
    badge_type: badge_type,
    score: score,
    date_issued: date_issued
  };
  try {
    const record = await CourseBadgeIssue.create(newCourseBadgeObj);
    return record._id;
  } catch (err) {
    logger.error(
      `Create CourseBadge failed with error ` +
        err +
        ` ; Doc object: ` +
        stringify(newCourseBadgeObj)
    );
    throw new Error('Create record failed');
  }
};

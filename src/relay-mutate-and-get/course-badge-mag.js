import { logger } from '../utils/logger';
import config from '../config';
import { calcUserCourseEma } from '../db-handlers/course/course-fetch';
import { createUserCourseBadge } from '../db-handlers/course-badge-cud';
import { fetchByUserCourseBatchType } from '../db-handlers/course-batch-fetch';

export const processGenCourseBadge = async (
  course_id,
  viewer,
  badge_type,
  info
) => {
  logger.debug(`in processGenCourseBadge`);

  const existingBadgeRecord = await fetchByUserCourseBatchType(
    viewer.user_id,
    course_id,
    badge_type
  );
  if (existingBadgeRecord && existingBadgeRecord.length > 0) {
    return {
      badge_uid: existingBadgeRecord[0]._id,
      completionObj: {
        code: '0',
        msg: 'Badge Already Exist',
        msg_id: 'badge_already-exist'
      }
    };
  }

  const date_issued = new Date();

  let courseEma = 0;
  try {
    courseEma = await calcUserCourseEma(course_id, viewer);
  } catch (err) {
    return {
      completionObj: {
        code: '1',
        msg: 'Course EMA calculation failed',
        msg_id: 'ema_calc_issue'
      }
    };
  }

  try {
    if (parseFloat(courseEma) < parseFloat(config.badgePassingScore)) {
      return {
        completionObj: {
          code: '1',
          msg: 'Passing grade not achieved',
          msg_id: 'below_passing_grade'
        }
      };
    }
  } catch (err) {
    return {
      completionObj: {
        code: '1',
        msg: 'Failed compare to Passing grade',
        msg_id: 'passing_grade_compare_issue'
      }
    };
  }

  let badge_uid = '';
  try {
    badge_uid = await createUserCourseBadge(
      course_id,
      viewer.user_id,
      badge_type,
      courseEma,
      date_issued
    );
  } catch (err) {
    return {
      completionObj: {
        code: '1',
        msg: 'Failed to create Badge',
        msg_id: 'failed_creating_badge'
      }
    };
  }

  return {
    badge_uid: badge_uid,
    completionObj: {
      code: '0',
      msg: '',
      msg_id: ''
    }
  };
};

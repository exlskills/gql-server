import { logger } from '../../utils/logger';
import { basicFind } from '../basic-query-handler';
import User from '../../db-models/user-model';

export const getUserCoursesAndRoles = async (
  user_id,
  course_id,
  roleArrayObj
) => {
  logger.debug(`in getUserCoursesAndRoles`);
  if (!user_id) {
    return [];
  }

  let result = [];

  let userObj;
  try {
    userObj = await basicFind(User, { isById: true }, user_id, null, {
      course_roles: 1
    });
  } catch (err) {
    return [];
  }

  for (let userCourse of userObj.course_roles) {
    if (result.find(e => e.course_id === userCourse.course_id)) {
      continue;
    }
    if (course_id && userCourse.course_id !== course_id) {
      continue;
    }
    if (roleArrayObj) {
      let roleInList = false;
      for (let role of roleArrayObj) {
        if (userCourse.role.includes(role)) {
          roleInList = true;
          break;
        }
      }
      if (!roleInList) {
        continue;
      }
    }
    result.push({
      course_id: userCourse.course_id,
      last_accessed_at: userCourse.last_accessed_at,
      role: userCourse.role
    });
  }

  logger.debug(`   getUserCoursesAndRoles result ` + JSON.stringify(result));
  return result;
};

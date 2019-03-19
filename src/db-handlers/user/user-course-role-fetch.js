import { logger } from '../../utils/logger';
import { basicFind } from '../basic-query-handler';
import User from '../../db-models/user-model';

export const getUserCoursesAndRoles = async (
  user_id,
  course_id,
  roleArrayObj
) => {
  logger.debug(`in getUserCoursesAndRoles `);
  logger.debug(`in getUserCoursesAndRoles user_id ` + user_id);
  logger.debug(`in getUserCoursesAndRoles course_id ` + course_id);
  logger.debug(`in getUserCoursesAndRoles roleArrayObj ` + roleArrayObj);
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

  //logger.debug(` getUserCoursesAndRoles userObj ` + JSON.stringify(userObj));

  for (let userCourse of userObj.course_roles) {
    //logger.debug(`  userCourse ` + JSON.stringify(userCourse));
    if (result.find(e => e.course_id === userCourse.course_id)) {
      //logger.debug(`skip double`);
      continue;
    }
    if (course_id && userCourse.course_id !== course_id) {
      //logger.debug(`course ID mismatch`);
      continue;
    }
    if (roleArrayObj && roleArrayObj.length > 0) {
      let roleInList = false;
      for (let role of roleArrayObj) {
        if (userCourse.role.includes(role)) {
          roleInList = true;
          break;
        }
      }
      if (!roleInList) {
        //logger.debug(`role mismatch`);
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

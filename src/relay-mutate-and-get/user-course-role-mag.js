import * as cud from '../db-handlers/user/user-course-role-cud';
import { logger } from '../utils/logger';

export const updateUserCourseRole = async (
  localUserId,
  localCourseId,
  cudContent,
  viewer,
  info
) => {
  logger.debug(`in updateUserCourseRole`);
  logger.debug(`     cudContent ` + JSON.stringify(cudContent));
  let completionObj = {
    code: '0',
    msg: ''
  };
  // TODO allow different roles and admin viewers
  if (viewer.user_id !== localUserId) {
    return Promise.reject('forbidden');
  }
  for (let e in cudContent) {
    if (e.field === 'role' && e.valueToAssign) {
      e.valueToAssign = 'learner';
    }
  }
  // cudContent is a required field - will have at least 1 element
  if (
    cudContent.some(e => e.field === 'UserCourseRole') &&
    cudContent.some(e => e.cudAction === 'D')
  ) {
    // Delete UserCourseRole object
    try {
      const res = await cud.deleteUserCourseRole_Object(
        localUserId,
        localCourseId
      );
      if (res.result === 1) {
        completionObj = {
          ...completionObj,
          ...res
        };
      } else {
        return Promise.reject('error deleting course role');
      }

      // Separate returns are coded in case more content is requested
      return {
        completionObj
      };
    } catch (err) {
      completionObj.code = '1';
      completionObj.msg = err;
      return {
        completionObj
      };
    }
  } else if (
    cudContent.some(e => e.field === 'UserCourseRole') &&
    cudContent.some(e => e.cudAction === 'C') &&
    cudContent.some(e => e.field === 'role')
  ) {
    // Create UserCourseRole object - must pass a Role

    const objContent = {
      role: []
    };
    cudContent.forEach(e => {
      if (e.field === 'role') {
        objContent.role.push(e.valueToAssign);
      } else if (e.field === 'last_accessed_at') {
        objContent.last_accessed_at = e.valueToAssign;
      }
    });
    try {
      const res = await cud.createUserCourseRole_Object(
        localUserId,
        localCourseId,
        objContent
      );
      if (res.result === 1) {
        completionObj = {
          ...completionObj,
          ...res
        };
      } else {
        return Promise.reject('error creating course role');
      }
      // Separate returns are coded in case more content is requested
      return {
        completionObj
      };
    } catch (err) {
      completionObj.code = '1';
      completionObj.msg = err;
      return {
        completionObj
      };
    }
  } else if (
    cudContent.some(e => e.field === 'last_accessed_at' && e.cudAction === 'U')
  ) {
    // Update UserCourseRole object - change last_accessed_at

    const objContent = {};
    objContent.last_accessed_at = cudContent.find(
      e => e.field === 'last_accessed_at'
    ).valueToAssign;
    try {
      const res = await cud.updateUserCourseRole_Object(
        localUserId,
        localCourseId,
        objContent
      );
      if (res.result === 1) {
        completionObj = {
          ...completionObj,
          ...res
        };
      } else {
        return Promise.reject('error updating course role');
      }
      // Separate returns are coded in case more content is requested
      return {
        completionObj
      };
    } catch (err) {
      completionObj.code = '1';
      completionObj.msg = err;
      return {
        completionObj
      };
    }
  } else if (cudContent[0].field === 'role') {
    // Process role update/delete requests (can be multiple, but other content is ignored)
    let roleArrayObj = [];
    cudContent.forEach(e => {
      if (e.field === 'role') {
        if (
          ['U', 'D'].includes(e.cudAction) &&
          (!e.valueToFind || e.valueToFind.length < 1)
        ) {
          completionObj.code = '1';
          completionObj.msg =
            'Invalid cud request: missing valueToFind for role action ' +
            e.cudAction;
          return {
            completionObj
          };
        }
        if (
          ['C', 'U'].includes(e.cudAction) &&
          (!e.valueToAssign || e.valueToAssign.length < 1)
        ) {
          completionObj.code = '1';
          completionObj.msg =
            'Invalid cud request: missing valueToAssign for role action ' +
            e.cudAction;
          return {
            completionObj
          };
        }
        const roleRecord = {
          ...e
        };
        roleArrayObj.push(roleRecord);
      }
    });

    try {
      const res = await cud.updateUserCourseRole_Role(
        localUserId,
        localCourseId,
        roleArrayObj
      );
      if (res.result === 1) {
        completionObj = {
          ...completionObj,
          ...res
        };
      } else {
        return Promise.reject('error updating course role');
      }
      // Separate returns are coded in case more content is requested
      return {
        completionObj
      };
    } catch (err) {
      completionObj.code = '1';
      completionObj.msg = err;
      return {
        completionObj
      };
    }
  } else {
    // Catch-all
    completionObj.code = '1';
    completionObj.msg = 'Invalid cud request sent';
    return {
      completionObj
    };
  }
};

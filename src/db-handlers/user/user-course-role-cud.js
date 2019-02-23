import User from '../../db-models/user-model';
import { basicFind } from '../../db-handlers/basic-query-handler';
import * as cudUtils from '../../utils/cud-utils';
import { logger } from '../../utils/logger';

export const updateUserCourseRole_Role = async (
  user_id,
  course_id,
  roleArrayObj
) => {
  logger.debug(`in updateUserCourseRole_Role`);
  let userObj;
  try {
    userObj = await basicFind(User, { isById: true }, user_id);
  } catch (err) {
    return Promise.reject('Find User failed', err);
  }

  if (!userObj) {
    return Promise.reject('User Not Found');
  }

  let course_role;
  if (userObj.course_roles) {
    course_role = userObj.course_roles.find(e => e.course_id === course_id);
    if (!course_role) {
      return Promise.reject('User is not associated with the Course');
    }
  } else {
    return Promise.reject('User is not associated with the Course');
  }

  const { processed, modified } = cudUtils.cudArrayElements(
    roleArrayObj,
    course_role.role,
    true
  );

  try {
    const res = await userObj.save();
    return { processed: processed, modified: modified, result: 1 };
  } catch (err) {
    return Promise.reject('Error updating User Course Role: ' + err);
  }
};

export const updateUserCourseRole_Object = async (
  user_id,
  course_id,
  objContent
) => {
  logger.debug(`in updateUserCourseRole_Object`);
  // This is used to update last_accessed_at
  // course_id is a key field and should never be updated
  // roles are updated via a different method
  const updateQuery = User.updateOne(
    { _id: user_id, 'course_roles.course_id': course_id },
    { $set: { 'course_roles.$.last_accessed_at': objContent.last_accessed_at } }
  );
  try {
    const res = await updateQuery.exec();
    return { processed: res.n, modified: res.nModified, result: res.ok };
  } catch (err) {
    return Promise.reject('Error updating User Course Role: ' + err);
  }
};

export const deleteUserCourseRole_Object = async (user_id, course_id) => {
  const updateQuery = User.updateOne(
    { _id: user_id, 'course_roles.course_id': course_id },
    { $pull: { course_roles: { course_id: course_id } } }
  );
  try {
    const res = await updateQuery.exec();
    return { processed: res.n, modified: res.nModified, result: res.ok };
  } catch (err) {
    return Promise.reject('Error deleting User Course Role: ' + err);
  }
};

export const createUserCourseRole_Object = async (
  user_id,
  course_id,
  objContent
) => {
  logger.debug(`in createUserCourseRole_Object`);
  // Check the same obj doesn't already exist
  try {
    const userObj = await basicFind(
      User,
      { isOne: true },
      { _id: user_id, 'course_roles.course_id': course_id },
      null,
      { _id: 1 }
    );
    if (userObj && userObj._id) {
      logger.debug(
        `in createUserCourseRole_Object - User is already associated with the Course`
      );
      return Promise.reject('User is already associated with the Course');
    }
  } catch (ignoring_should_not_happen) {
    // Proceed with the logic below
  }

  const push_elem = {
    $push: { course_roles: { course_id: course_id, ...objContent } }
  };
  logger.debug(`in createUserCourseRole_Object - running update`);
  const updateQuery = User.updateOne({ _id: user_id }, push_elem);

  try {
    const res = await updateQuery.exec();
    return { processed: res.n, modified: res.nModified, result: res.ok };
  } catch (err) {
    return Promise.reject('Error creating User Course Role: ' + err);
  }
};

export const updateLastAccessedAt = async (user_id, course_id, dateVal) => {
  logger.debug(`in updateLastAccessedAt`);
  try {
    return await User.updateOne(
      { _id: user_id },
      { $set: { 'course_roles.$[elem].last_accessed_at': dateVal } },
      {
        arrayFilters: [{ 'elem.course_id': course_id }]
      }
    ).exec();
  } catch (err) {
    logger.error(`in user-course-role-cud updateLastAccessedAt ` + err);
  }
};

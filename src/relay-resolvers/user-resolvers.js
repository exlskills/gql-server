import { basicFind } from '../db-handlers/basic-query-handler';
import {
  profileById,
  fetchUserActivities
} from '../db-handlers/user/user-fetch';
import User from '../db-models/user-model';
import { mdbUserToGqlUser } from '../parsers/user-parser';
import { toGlobalId, fromGlobalId } from 'graphql-relay';
import moment from 'moment';

export const findUserById = async (user_id, viewer, info) => {
  let userRecord;
  try {
    //model, runParams, queryVal, sortVal, selectVal
    userRecord = await basicFind(User, { isById: true }, user_id);
  } catch (errInternalAllreadyReported) {
    return null;
  }

  try {
    userRecord = await mdbUserToGqlUser(userRecord, viewer);
  } catch (errInternalAllreadyReported) {
    return null;
  }

  return userRecord;
};

export const resolveUserProfileSpecific = async (obj, args, viewer, info) => {
  try {
    let userId = args && args.user_id ? args.user_id : viewer.user_id;
    userId = fromGlobalId(userId).id;
    let userRecord = await profileById(userId, viewer);
    let locale = viewer.locale;
    return mdbUserToGqlUser(userRecord, { userId, locale });
  } catch (error) {
    return Promise.reject(error);
  }
};

export const resolveUserProfile = async (obj, args, viewer, info) => {
  try {
    let userRecord = await profileById(viewer.user_id, viewer);
    const locale = args && args.locale ? args.locale : viewer.locale;
    return mdbUserToGqlUser(userRecord, { user_id: viewer.user_id, locale });
  } catch (error) {
    return Promise.reject(error);
  }
};

export const resolveUserActivities = async (obj, args, viewer, info) => {
  if (!args || !args.start_date || !args.end_date) {
    return Promise.reject('start_date and end_date are required');
  }

  let startDate = moment(args.start_date, 'YYYY-MM-DD');
  let endDate = moment(args.end_date, 'YYYY-MM-DD');
  if (!startDate.isValid() || !endDate.isValid()) {
    return Promise.reject('start_date and/or end_date are not valid');
  }
  startDate = startDate.startOf('day');
  endDate = endDate.endOf('day');

  try {
    return await fetchUserActivities(
      viewer.user_id,
      startDate.toDate(),
      endDate.toDate()
    );
  } catch (error) {
    return Promise.reject(error);
  }
};

export const resolveUserActivitiesById = async (obj, args, viewer, info) => {
  if (!args || !args.start_date || !args.end_date) {
    return Promise.reject('start_date and end_date are required');
  }

  let startDate = moment(args.start_date, 'YYYY-MM-DD');
  let endDate = moment(args.end_date, 'YYYY-MM-DD');
  if (!startDate.isValid() || !endDate.isValid()) {
    return Promise.reject('start_date and/or end_date are not valid');
  }
  startDate = startDate.startOf('day');
  endDate = endDate.endOf('day');
  let userId = fromGlobalId(args.user_id).id;
  try {
    return await fetchUserActivities(
      userId,
      startDate.toDate(),
      endDate.toDate()
    );
  } catch (error) {
    return Promise.reject(error);
  }
};

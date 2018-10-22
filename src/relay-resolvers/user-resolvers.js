import { basicFind } from '../db-handlers/basic-query-handler';
import { fetchUserProfileById } from '../db-handlers/user/user-fetch';
import User from '../db-models/user-model';
import { mdbUserToGqlUser } from '../parsers/user-parser';
import { fromGlobalId } from 'graphql-relay';
import moment from 'moment';
import { logger } from '../utils/logger';
import { connectionFromDataSource } from '../paging-processor/connection-from-datasource';
import { fetchUserList } from '../db-handlers/user/user-list-fetch';
import { getUserActivityCountByDate } from '../db-handlers/activity-handler';

export const findUserById = async (user_id, viewer, info) => {
  logger.debug(`in findUserById`);
  let userRecord;
  try {
    //model, runParams, queryVal, sortVal, selectVal
    userRecord = await basicFind(User, { isById: true }, user_id);
  } catch (errInternalAlreadyReported) {
    return null;
  }

  try {
    userRecord = await mdbUserToGqlUser(userRecord, viewer);
  } catch (errInternalAlreadyReported) {
    return null;
  }

  return userRecord;
};

export const resolveUserProfile = async (obj, args, viewer, info) => {
  logger.debug(`in resolveUserProfile`);
  try {
    let userId =
      args && args.user_id ? fromGlobalId(userId).id : viewer.user_id;
    let userRecord = await fetchUserProfileById(userId, viewer);
    let locale = viewer.locale;
    return mdbUserToGqlUser(userRecord, { userId, locale });
  } catch (error) {
    return Promise.reject(error);
  }
};

export const resolveUserActivityCountByDate = async (
  obj,
  args,
  viewer,
  info
) => {
  logger.debug(`in resolveUserActivityCountByDate`);
  logger.debug(` args ` + JSON.stringify(args));

  let startDate = null;
  let endDate = null;
  if (args.dateRange) {
    if (args.dateRange.date_from) {
      startDate = args.dateRange.date_from;
    }
    if (args.dateRange.date_to) {
      endDate = args.dateRange.date_to;
    }
  } else {
    startDate = moment()
      .utc()
      .startOf('day')
      .toDate();
    endDate = moment()
      .utc()
      .endOf('day')
      .toDate();
  }

  try {
    return await getUserActivityCountByDate(
      viewer.user_id,
      startDate,
      endDate,
      args.activityTypes
    );
  } catch (error) {
    return Promise.reject(error);
  }
};

export const resolveListInstructors = async (obj, args, viewer, info) => {
  logger.debug(`in resolveListInstructors`);
  logger.debug(` args ` + JSON.stringify(args));

  const businessKey = '_id';
  args.filterValues = { is_instructor: true };

  const resolverArgs = {};
  if (args.resolverArgs) {
    try {
      for (let arg of args.resolverArgs) {
        resolverArgs[arg.param] = arg.value;
      }
    } catch (err) {
      return Promise.reject('Malformed parameters. Error ' + err);
    }
  }

  const fetchParameters = {
    list_type: 'instructors',
    instructorTopics: args.instructorTopics,
    resolverArgs: resolverArgs
  };

  const execDetails = {
    queryFunction: fetchUserList,
    businessKey: businessKey,
    fetchParameters: fetchParameters
  };

  return connectionFromDataSource(execDetails, obj, args, viewer, info);
};

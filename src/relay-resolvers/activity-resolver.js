import {
  connectionFromDataSource,
  connectionFromArrayWithFrame,
  attachEmptyFrame
} from '../paging-processor/connection-from-datasource';
import { fetchActivities } from '../db-handlers/activity-fetch';
import { logger } from '../utils/logger';

export const resolveActivities = async (obj, args, viewer, info) => {
  logger.debug(`in resolveActivities`);

  logger.debug(` args ` + JSON.stringify(args));

  const businessKey = '_id';
  const fetchParameters = {
    user_id: viewer.user_id,
    activityTypes: args.activityTypes,
    dateRange: args.dateRange,
    listDefVersion: args.listDefVersion ? args.listDefVersion : 0
  };

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

  fetchParameters.resolverArgs = resolverArgs;

  const execDetails = {
    queryFunction: fetchActivities,
    businessKey: businessKey,
    fetchParameters: fetchParameters
  };

  return connectionFromDataSource(execDetails, obj, args, viewer, info);
};

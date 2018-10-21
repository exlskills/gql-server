import {
  connectionFromDataSource,
  connectionFromArrayWithFrame,
  attachEmptyFrame
} from '../paging-processor/connection-from-datasource';
import { fetchActivities } from '../db-handlers/activity-handler';
import { logger } from '../utils/logger';

export const resolveActivities = async (obj, args, viewer, info) => {
  logger.debug(`in resolveActivities`);

  logger.debug(` args ` + JSON.stringify(args));

  const businessKey = '_id';
  const fetchParameters = {
    user_id: viewer.user_id
  };

  const resolverArgs = {
    activityTypes: args.activityTypes,
    dateRange: args.dateRange
  };
  if (args.resolverArgs) {
    try {
      for (let arg of args.resolverArgs) {
        resolverArgs[arg.param] = arg.value;
      }
    } catch (err) {
      return Promise.reject('Malformed parameters. Error ' + err);
    }
  }
  // By default, use the latest version in list_def
  resolverArgs.listdef_version = resolverArgs.listdef_version
    ? resolverArgs.listdef_version
    : 0;

  fetchParameters.resolverArgs = resolverArgs;

  const execDetails = {
    queryFunction: fetchActivities,
    businessKey: businessKey,
    fetchParameters: fetchParameters
  };

  return connectionFromDataSource(execDetails, obj, args, viewer, info);
};

import {
  connectionFromDataSource,
  connectionFromArrayWithFrame,
  attachEmptyFrame
} from '../paging-processor/connection-from-datasource';
import { fetchActivities } from '../db-handlers/activity-handler';
import { logger } from '../utils/logger';

export const resolveActivities = async (obj, args, viewer, info) => {
  logger.debug(`in resolveActivities`);
  const businessKey = '_id';
  const fetchParameters = {};
  fetchParameters.user_id = viewer.user_id;
  if (args.resolverArgs) {
    const date = args.resolverArgs.find(e => e.param === 'input_date');
    fetchParameters.input_date = date.value;

    const group = args.resolverArgs.find(e => e.param === 'group');
    fetchParameters.group = !!group.value;
  }
  const execDetails = {
    queryFunction: fetchActivities,
    businessKey: businessKey,
    fetchParameters: fetchParameters
  };

  return connectionFromDataSource(execDetails, obj, args, viewer, info);
};

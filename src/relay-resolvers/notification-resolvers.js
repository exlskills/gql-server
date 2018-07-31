import { fetchNotifications } from '../db-handlers/notification-fetch';
import { connectionFromDataSource } from '../paging-processor/connection-from-datasource';

/**
 * Resolve function for Notifications paging query
 * @param {any} obj Not used for the moment
 * @param {object} args GraphQL Arguments
 *   {array} resolverArgs: List of {param, value} objects to filter the notifications list
 *     unread: Any value would only show unread notifications
 * @param {object} viewer Contextual information. Including logged in user data
 * @param {object} info Containing information about the execution info
 * @return {object} Paging object
 */
export const resolveNotifications = async (obj, args, viewer, info) => {
  const fetchParameters = { userId: viewer.user_id };

  if (args.resolverArgs) {
    const unreadParam = args.resolverArgs.find(e => e.param == 'unread');
    if (unreadParam) {
      fetchParameters.unread = true;
    }
  }

  const execDetails = {
    queryFunction: fetchNotifications,
    businessKey: '_id',
    fetchParameters: fetchParameters
  };

  return connectionFromDataSource(execDetails, obj, args, viewer, info);
};

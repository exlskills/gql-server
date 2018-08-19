import { basicFind } from '../db-handlers/basic-query-handler';
import Notification from '../db-models/notification-model';
import * as projectionWriter from '../utils/projection-writer';
import { logger } from '../utils/logger';

export const findById = async (obj_id, viewer, info) => {
  logger.debug(`in Notification findById`);
  let record;
  try {
    //model, runParams, queryVal, sortVal, selectVal
    record = await basicFind(Notification, { isById: true }, obj_id);
  } catch (errInternalAllreadyReported) {
    return null;
  }
  return record;
};

/**
 * Fetch Notifications with filters and paging
 * @param {object} filterValues Not used
 * @param {array} aggregateArray Contains `$sort`, `$skip` and `$limit` object for the MDB query
 * @param {string} viewerLocale Locale of the current user to get text from Intl object
 * @param {object} fetchParameters Conditions to filter and display the notifications list
 *   {string} userId: To fetch notifications which belong to the user
 *   {boolean} unread: Whether to fetch only unread notifications
 * @return {Promise} The list of notifications on success, Promise.reject on error.
 */
export const fetchNotifications = (
  filterValues,
  aggregateArray,
  viewerLocale,
  fetchParameters
) => {
  logger.debug(`in fetchNotifications`);
  let selectFields = {
    notification_link: 1,
    is_read: 1,
    created_at: 1
  };

  // TODO: find easier way for custom sort...
  // let sort = aggregateArray.find(item => !!item.$sort);
  let sort = { $sort: { created_at: -1 } };
  let skip = aggregateArray.find(item => !!item.$skip);
  let limit = aggregateArray.find(item => !!item.$limit);

  let array = [];
  array.push({ $match: { user_id: fetchParameters.userId } });

  if (fetchParameters.unread) {
    array.push({
      $project: {
        notifications: {
          $filter: {
            input: '$notifications',
            cond: { $eq: ['$$this.is_read', false] }
          }
        }
      }
    });
  }

  array.push({ $unwind: '$notifications' });
  array.push({ $replaceRoot: { newRoot: '$notifications' } });

  array.push({
    $lookup: {
      from: 'list_def',
      localField: 'def_id',
      foreignField: '_id',
      as: 'list_defs'
    }
  });
  array.push({ $unwind: '$list_defs' });
  array.push({
    $project: {
      ...selectFields,
      contents: {
        $filter: {
          input: '$list_defs.contents',
          cond: { $eq: ['$$this.version', '$list_defs.latest_version'] }
        }
      }
    }
  });
  array.push({ $unwind: '$contents' });
  array.push({
    $project: {
      ...selectFields,
      'content.intlString': projectionWriter.writeIntlStringFilter(
        'contents.content',
        viewerLocale
      )
    }
  });
  array.push({
    $project: {
      ...selectFields,
      content: projectionWriter.writeIntlStringEval('content', viewerLocale)
    }
  });

  if (sort) array.push(sort);
  if (skip) array.push(skip);
  if (limit) array.push(limit);

  return Notification.aggregate(array).exec();
};

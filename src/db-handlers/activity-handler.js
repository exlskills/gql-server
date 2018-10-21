import { basicFind } from '../db-handlers/basic-query-handler';
import * as projectionWriter from '../utils/projection-writer';
import Activity from '../db-models/activity-model';
import moment from 'moment';
import { logger } from '../utils/logger';

export const fetchById = async (obj_id, selectVal, viewer, info) => {
  logger.debug(`in Activity fetchById`);
  let record;
  try {
    record = await basicFind(
      Activity,
      { isById: true },
      obj_id,
      null,
      selectVal
    );
  } catch (errInternalAlreadyReported) {
    return null;
  }
  return record;
};

export const fetchActivities = async (
  filterValues,
  aggregateArray,
  viewerLocale,
  fetchParameters
) => {
  logger.debug(`in fetchActivities`);
  logger.debug(` fetchParameters ` + JSON.stringify(fetchParameters));

  let array = [];
  let elem;

  let sort = aggregateArray.find(item => !!item.$sort);
  let skip = aggregateArray.find(item => !!item.$skip);
  let limit = aggregateArray.find(item => !!item.$limit);

  const matchObj = { user_id: fetchParameters.user_id };

  if (fetchParameters.dateRange) {
    const dateRange = fetchParameters.dateRange;
    if (dateRange.date_from && dateRange.date_to) {
      matchObj.date = {
        $gte: dateRange.date_from,
        $lte: dateRange.date_to
      };
    } else if (dateRange.date_from) {
      matchObj.date = {
        $gte: dateRange.date_from
      };
    } else {
      matchObj.date = {
        $lte: dateRange.date_to
      };
    }
  }

  if (fetchParameters.activityTypes) {
    matchObj.listdef_value = {
      $in: fetchParameters.activityTypes
    };
  }

  elem = { $match: matchObj };
  array.push(elem);

  let array_ld = [];
  elem = {
    $match: {
      $expr: {
        $and: [
          { $eq: ['$type', 'activity'] },
          { $eq: ['$value', '$$listdef_value'] }
        ]
      }
    }
  };
  array_ld.push(elem);

  elem = {
    $project: {
      content_vers: {
        $cond: [
          { $eq: [fetchParameters.listDefVersion, 0] },
          '$latest_version',
          fetchParameters.listDefVersion
        ]
      },
      'desc.intlString': projectionWriter.writeIntlStringFilter(
        'desc',
        viewerLocale
      ),
      contents: 1
    }
  };
  array_ld.push(elem);

  elem = {
    $project: {
      content_vers: 1,
      desc: projectionWriter.writeIntlStringEval('desc', viewerLocale),
      contents: {
        $filter: {
          input: '$contents',
          cond: { $eq: ['$$this.version', '$content_vers'] }
        }
      }
    }
  };
  array_ld.push(elem);

  elem = { $unwind: '$contents' };
  array_ld.push(elem);

  elem = {
    $project: {
      content_vers: 1,
      desc: 1,
      content: '$contents.content'
    }
  };
  array_ld.push(elem);

  elem = {
    $project: {
      content_vers: 1,
      desc: 1,
      'content.intlString': projectionWriter.writeIntlStringFilter(
        'content',
        viewerLocale
      )
    }
  };
  array_ld.push(elem);

  elem = {
    $project: {
      content_vers: 1,
      desc: 1,
      content: projectionWriter.writeIntlStringEval('content', viewerLocale)
    }
  };
  array_ld.push(elem);

  elem = {
    $lookup: {
      from: 'list_def',
      let: { listdef_value: '$listdef_value' },
      pipeline: array_ld,
      as: 'list_def'
    }
  };
  array.push(elem);

  elem = { $unwind: '$list_def' };
  array.push(elem);

  elem = {
    $project: {
      _id: 1,
      user_id: 1,
      date: 1,
      activity_link: 1,
      type: '$listdef_value',
      type_desc: '$list_def.desc',
      content: '$list_def.content'
    }
  };
  array.push(elem);

  sort = sort ? sort : { $sort: { date: 1 } };
  array.push(sort);

  if (skip) array.push(skip);
  if (limit) array.push(limit);

  const result = await Activity.aggregate(array).exec();
  logger.debug(`  result ` + JSON.stringify(result));
  return result;
};

export const getUserActivityCountByDate = async (
  userId,
  startDate,
  endDate,
  activityTypes,
  viewer,
  info
) => {
  logger.debug(`in getUserActivityCountByDate`);
  let record;

  let array = [];
  let elem;

  const matchObj = { user_id: userId };

  if (startDate && endDate) {
    matchObj.date = {
      $gte: startDate,
      $lte: endDate
    };
  } else if (startDate) {
    matchObj.date = {
      $gte: startDate
    };
  } else if (endDate) {
    matchObj.date = {
      $lte: endDate
    };
  }

  if (activityTypes) {
    matchObj.listdef_value = {
      $in: activityTypes
    };
  }

  elem = { $match: matchObj };
  array.push(elem);

  elem = {
    $group: {
      _id: {
        $dateToString: {
          format: '%Y-%m-%d',
          date: '$date'
        }
      },
      count: {
        $sum: 1
      }
    }
  };
  array.push(elem);

  elem = {
    $project: {
      date: '$_id',
      count: 1
    }
  };
  array.push(elem);

  try {
    return await Activity.aggregate(array).exec();
  } catch (err) {
    return Promise.reject('Find failed', err);
  }
};

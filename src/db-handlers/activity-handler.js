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

  /*
  let user_id = fetchParameters.user_id;
  let input_date = fetchParameters.input_date;
  let startDay = moment(input_date)
    .startOf('day')
    .toDate();
  let endDay = moment(input_date)
    .add(1, 'day')
    .toDate();

  let fieldToSelect = {
    activity_link: 1,
    date: 1
  };
  let sort = { $sort: { date: -1 } };
  if (fetchParameters.group) {
    sort = { $sort: { type: 1, date: -1 } };
  }
  let skip = aggregateArray.find(item => !!item.$skip);
  let limit = aggregateArray.find(item => !!item.$limit);

  let array = [];
  let elem;

  elem = { $match: { user_id, date: { $gte: startDay, $lte: endDay } } };
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
    $lookup: {
      from: 'list_def',
      let: { listdef_value: '$listdef_value' },
      pipeline: array_ld,
      as: 'list_def'
    }
  };
  array.push(elem);

  */
  /*
  let: { order_item: "$item", order_qty: "$ordered" },
  pipeline: [

    { $project: { stock_item: 0, _id: 0 } }
  ],
    as: "stockdata"
}


    {
      $lookup: {
        from: '',
        localField: 'def_id',
        foreignField: '_id',
        as: 'list_def'
      }
    },

    { $unwind: '$list_def' },
    {
      $project: {
        contents: {
          $filter: {
            input: '$list_def.contents',
            cond: { $eq: ['$$this.version', '$list_def.latest_version'] }
          }
        },
        type: '$list_def.value',
        'type_desc.intlString': projectionWriter.writeIntlStringFilter(
          'list_def.desc',
          viewerLocale
        ),
        ...fieldToSelect
      }
    },
    { $unwind: '$contents' },
    {
      $project: {
        type: 1,
        ...fieldToSelect,
        'content.intlString': projectionWriter.writeIntlStringFilter(
          'contents.content',
          viewerLocale
        ),
        type_desc: projectionWriter.writeIntlStringEval(
          'type_desc',
          viewerLocale
        )
      }
    },
    {
      $project: {
        type: 1,
        type_desc: 1,
        ...fieldToSelect,
        content: projectionWriter.writeIntlStringEval('content', viewerLocale)
      }
    }
  ];
  */

  /*
  if (sort) array.push(sort);
  if (skip) array.push(skip);
  if (limit) array.push(limit);
  return await Activity.aggregate(array).exec();
  */
  return [];
};

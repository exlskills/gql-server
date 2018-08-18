import { basicFind } from '../db-handlers/basic-query-handler';
import * as projectionWriter from '../utils/projection-writer';
import Activity from '../db-models/activity-model';
import moment from 'moment';

export const findById = async (obj_id, viewer, info) => {
  console.log(`in Activity findById`);
  let record;
  try {
    record = await basicFind(Activity, { isById: true }, obj_id);
  } catch (errInternalAllreadyReported) {
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
  console.log(`in fetchActivities`);
  let user_id = fetchParameters.user_id;
  let input_date = fetchParameters.input_date;
  let startDate = moment(input_date)
    .startOf('day')
    .format('YYYY-MM-DDT00:00:00');
  let endDate = moment(input_date).add(1, 'day').format('YYYY-MM-DDTHH:mm:ss');
  let arrayStartDate = startDate.split('T');
  let arrayEndDate = endDate.split('T');
  let startDay = new Date(arrayStartDate[0]);
  let endDay = new Date(arrayEndDate[0]);

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
  const array = [
    { $match: { user_id, date: { $gte: startDay, $lte: endDay } } },
    {
      $lookup: {
        from: 'list_def',
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
  if (sort) array.push(sort);
  if (skip) array.push(skip);
  if (limit) array.push(limit);
  return await Activity.aggregate(array).exec();
};

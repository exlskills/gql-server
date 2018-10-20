import { logger } from '../utils/logger';
import ListDef from '../db-models/list-def-model';
import * as projectionWriter from '../utils/projection-writer';

export const fetchTopic = async (obj_id, viewer, info) => {
  logger.debug(`in fetchTopic`);
  let array = [
    {
      $match: {
        type: 'topic'
      }
    },
    {
      $project: {
        _id: 1,
        value: 1
      }
    }
  ];
  return await ListDef.aggregate(array).exec();
};

export const findValuesByTypeAndDesc = async (
  defType,
  matchStringArray,
  locale,
  viewer,
  info
) => {
  logger.debug(`in findValuesByTypeAndDesc`);

  let elem;

  elem = {
    $match: {
      type: defType
    }
  };
  array.push(elem);

  elem = {
    $project: {
      _id: 1,
      value: 1,
      'desc.intlString': projectionWriter.writeIntlStringFilter('desc', locale)
    }
  };
  array.push(elem);

  elem = {
    $project: {
      _id: 1,
      value: 1,
      desc: projectionWriter.writeIntlStringEval('desc', locale)
    }
  };
  array.push(elem);

  if (matchStringArray) {
    elem = { $match: { desc: { $in: matchStringArray } } };
    array.push(elem);
  }

  const result = await ListDef.aggregate(array).exec();
  logger.debug(`   result ` + JSON.stringify(result));
  return result;
};

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

export const fetchLocalArrayByTypeAndValueArray = async (
  defType,
  valueArray,
  locale,
  content_version_override = 0,
  viewer,
  info
) => {
  logger.debug(`in fetchLocalArrayByTypeAndValueArray`);

  let array = [];
  let elem;

  elem = {
    $match: {
      type: defType,
      $expr: { $in: ['$value', valueArray] }
    }
  };
  array.push(elem);

  elem = {
    $project: {
      value: 1,
      latest_version: 1,
      'desc.intlString': projectionWriter.writeIntlStringFilter('desc', locale),
      contents: {
        $filter: {
          input: '$contents',
          cond: {
            $eq: [
              '$$this.version',
              {
                $cond: [
                  { $gt: [content_version_override, 0] },
                  content_version_override,
                  '$latest_version'
                ]
              }
            ]
          }
        }
      }
    }
  };
  array.push(elem);

  elem = { $unwind: '$contents' };
  array.push(elem);

  elem = {
    $project: {
      value: 1,
      desc: projectionWriter.writeIntlStringEval('desc', locale),
      content: '$contents.content'
    }
  };
  array.push(elem);

  elem = {
    $project: {
      value: 1,
      desc: 1,
      'content.intlString': projectionWriter.writeIntlStringFilter(
        'content',
        locale
      )
    }
  };
  array.push(elem);

  elem = {
    $project: {
      value: 1,
      desc: 1,
      content: projectionWriter.writeIntlStringEval('content', locale)
    }
  };
  array.push(elem);

  const result = await ListDef.aggregate(array).exec();
  logger.debug(`   result ` + JSON.stringify(result));
  return result;
};

export const fetchLocalDescArrayByTypeAndValueArray = async (
  defType,
  valueArray,
  locale,
  viewer,
  info
) => {
  logger.debug(`in fetchLocalDescArrayByTypeAndValueArray`);

  let array = [];
  let elem;

  elem = {
    $match: {
      type: defType,
      $expr: { $in: ['$value', valueArray] }
    }
  };
  array.push(elem);

  elem = {
    $project: {
      value: 1,
      'desc.intlString': projectionWriter.writeIntlStringFilter('desc', locale)
    }
  };
  array.push(elem);

  elem = {
    $project: {
      value: 1,
      desc: projectionWriter.writeIntlStringEval('desc', locale)
    }
  };
  array.push(elem);

  const result = await ListDef.aggregate(array).exec();
  logger.debug(`   result ` + JSON.stringify(result));
  return result;
};

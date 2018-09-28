import { logger } from '../utils/logger';
import ListDef from '../db-models/list-def-model';

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

import { fetchTopicFromCache } from '../db-handlers/list-def-fetch';

export const resolveFilterTopic = async (obj, args, viewer, info) =>
  await fetchTopicFromCache('', viewer, info);

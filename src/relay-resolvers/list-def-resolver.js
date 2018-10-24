import { fetchTopic } from '../db-handlers/list-def-fetch';

export const resolveFilterTopic = async (obj, args, viewer, info) =>
  await fetchTopic('', viewer, info);

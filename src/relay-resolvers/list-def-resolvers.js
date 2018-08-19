import { fetchTopic } from '../db-handlers/list-def';

export const resolveFilterTopic = async (obj, args, viewer, info) =>
  await fetchTopic('', viewer, info);

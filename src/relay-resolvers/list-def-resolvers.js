import { fetchTopic } from '../db-handlers/course/course-fetch';
import { connectionFromDataSource } from '../paging-processor/connection-from-datasource';
import { getStringByLocale } from '../parsers/intl-string-parser';

export const resolveFilterTopic = async (obj, args, viewer, info) =>
  await fetchTopic('', viewer, info);

import config from '../config';
import { logger } from '../utils/logger';
import { delay } from '../utils/timeout';
import { loadCourseCache, loadCourseDeliveryCache } from './course-cache';
import { loadListDefCache } from './misc-cache';

export const initCacheLoad = async () => {
  // Initial Load
  await Promise.all([
    loadCourseCache(true, null),
    loadCourseDeliveryCache(true, null),
    loadListDefCache(true, null)
  ]);

  for (;;) {
    logger.debug(`pausing for min(s) ` + config.cacheRefreshIntervalMin);
    await delay(1000 * 60 * config.cacheRefreshIntervalMin);
    await Promise.all([
      loadCourseCache(false, null),
      loadCourseDeliveryCache(false, null),
      loadListDefCache(false, null)
    ]);
  }
};

import config from '../config';
import { logger } from '../utils/logger';
import { delay } from '../utils/timeout';
import { loadCourseCache, loadCourseDeliveryCache } from './course-cache';
import { loadListDefCache } from './misc-cache';
import { getRandomArbitrary } from '../utils/randomization';

export const initCacheLoad = async () => {
  // Initial Load
  await Promise.all([
    loadCourseCache(true, null),
    loadCourseDeliveryCache(true, null),
    loadListDefCache(true, null)
  ]);

  for (;;) {
    let delay_minutes = config.cacheRefreshIntervalMin;
    if (process.env.NODE_ENV === 'production' || config.activateTestMode) {
      delay_minutes += getRandomArbitrary(-1, 1);
    }
    logger.debug(`pausing for min(s) ` + delay_minutes);
    await delay(1000 * 60 * delay_minutes);
    await Promise.all([
      loadCourseCache(false, null),
      loadCourseDeliveryCache(false, null),
      loadListDefCache(false, null)
    ]);
  }
};

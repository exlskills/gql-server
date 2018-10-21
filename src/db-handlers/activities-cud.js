import Activity from '../db-models/activity-model';
import { logger } from '../utils/logger';
import { stringify } from 'flatted/cjs';

export const createActivity = async newActivityObj => {
  logger.debug(`in createActivity`);
  try {
    const activityRecord = await Activity.create(newActivityObj);
    return activityRecord._id;
  } catch (err) {
    logger.error(
      `Create Activity failed with error ` +
        err +
        ` ; Doc object: ` +
        stringify(newActivityObj)
    );
    return null;
  }
};

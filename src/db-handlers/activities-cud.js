import Activity from '../db-models/activity-model';
import ListDef from '../db-models/list-def-model';
import { logger } from '../utils/logger';

export const createActivity = async (user_id, newActivityObj) => {
  logger.debug(`in createActivity`);

  // TODO - code to use list-def handler fetchByTypeAndValue
  try {
    let def = await ListDef.findOne({
      type: 'activity',
      value: newActivityObj.listDef_value
    }).exec();
    if (!def) {
      return Promise.reject('No listDef found', null);
    }

    let userActivity = new Activity({
      user_id,
      date: new Date(),
      def_id: def._id,
      activity_link: newActivityObj.activity_link,
      doc_ref: newActivityObj.doc_ref
    });
    return await userActivity.save();
  } catch (err) {
    return Promise.reject('Error adding to DB', err);
  }
};

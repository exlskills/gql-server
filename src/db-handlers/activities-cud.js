import Activity from '../db-models/activity-model';
import ListDef from '../db-models/list-def-model';

export const createActivity = async (user_id, object) => {
  try {
    let def = await ListDef.findOne({ value: object.listDef_value }).exec();
    if (!def) {
      return Promise.reject('No listDef found', null);
    }

    let userActivity = new Activity({
      user_id,
      date: new Date(),
      def_id: def._id,
      activity_link: object.activity_link,
      doc_ref: object.doc_ref
    });
    return await userActivity.save();
  } catch (err) {
    return Promise.reject('Error adding to DB', err);
  }
};

import { logger } from '../../utils/logger';
import { basicFind } from '../basic-query-handler';
import { id_gen } from '../../utils/url-id-generator';
import UserOrders from '../../db-models/user-orders-model';

export const fetchByUserAndItem = async (
  user_id,
  item_cat,
  item_level,
  item_id
) => {
  let record;
  try {
    record = await basicFind(
      UserOrders,
      { isOne: true },
      {
        user_id: user_id,
        'order_items.item_category': item_cat,
        'order_items.item_id.doc_id': item_id,
        'order_items.item_id.level': item_level
      },
      null,
      null
    );
  } catch (errInternalAlreadyReported) {
    return null;
  }
  return record;
};

export const insertOrderRecord = async (user_id, payer_id, itemObjArray) => {
  logger.debug(`in insertOrderRecord`);
  const order_id = id_gen();
  const userOrdersObj = {
    _id: order_id,
    user_id: user_id,
    payer_id: payer_id,
    order_items: itemObjArray
  };
  let promises = [];
  promises.push(UserOrders.create(userOrdersObj));
  await Promise.all(promises);
  logger.debug(`Order Record inserted with ID ` + order_id);
  return order_id;
};

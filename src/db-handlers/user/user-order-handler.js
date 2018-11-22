import { logger } from '../../utils/logger';
import { basicFind } from '../basic-query-handler';
import UserOrder from '../../db-models/user-order-model';
import {
  ITEM_CATEGORY_COURSE_CERTIFICATE,
  ITEM_CATEGORY_COURSE_RUN
} from '../../db-models/order-item-model';

export const fetchByUserAndItemRefId = async (
  user_id,
  item_cat,
  item_ref_id
) => {
  const queryVal = {
    user_id: user_id,
    'order_items.item_category': item_cat
  };
  switch (item_cat) {
    case ITEM_CATEGORY_COURSE_CERTIFICATE:
      queryVal['order_items.item_ref.course_id'] = item_ref_id;
      break;
    case ITEM_CATEGORY_COURSE_RUN:
      queryVal['order_items.item_ref.cd_run_id'] = item_ref_id;
      break;
  }
  let record;
  try {
    record = await basicFind(UserOrder, { isOne: true }, queryVal, null, null);
  } catch (errInternalAlreadyReported) {
    return null;
  }
  return record;
};
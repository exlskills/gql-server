import mongoose from 'mongoose';
import { id_gen } from '../utils/url-id-generator';
import OrderItemSchema from './order-item-model';

const UserOrderSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: id_gen
    },
    user_id: {
      type: String,
      ref: 'User',
      required: true,
      index: true
    },
    payer_id: {
      type: String,
      ref: 'User',
      required: true,
      index: true
    },
    order_items: {
      type: [OrderItemSchema]
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.model('UserOrder', UserOrderSchema, 'user_order');

// TODO: create separate indexes
UserOrderSchema.index({
  'order_items.item_ref.course_id': 1,
  'order_items.item_ref.cd_run_id': 1
});

import mongoose from 'mongoose';
import { id_gen } from '../utils/url-id-generator';

export default new mongoose.Schema(
  {
    _id: {
      type: String,
      default: id_gen
    },
    item_category: {
      type: String,
      required: true
    },
    item_options: {
      type: Object,
      default: {}
    },
    item_ref: {
      type: Object,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1
    },
    amount: {
      type: Number,
      required: true,
      default: 0
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export const ITEM_CATEGORY_COURSE_CERTIFICATE = 'course_cert';
export const ITEM_CATEGORY_COURSE_RUN = 'course_run';

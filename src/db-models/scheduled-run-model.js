import mongoose from 'mongoose';
import SchedRunSession from './sched-run-session-model';
import { id_gen } from '../utils/url-id-generator';
import ItemPrice from './item-price-model';

export default new mongoose.Schema(
  {
    _id: {
      type: String,
      default: id_gen
    },
    active: {
      type: Boolean,
      default: true
    },
    scheduling_timezone: String,
    run_start_date: {
      type: Date
    },
    instructors: {
      type: [String]
    },
    offered_at_price: {
      type: ItemPrice
    },
    sessions: {
      type: [SchedRunSession]
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

import mongoose from 'mongoose';
import ScheduledRunSchema from './scheduled-run-model';
import CourseDeliverySchedSessionSchema from './course-delivery-session-model';
import ItemPrice from './item-price-model';
import { id_gen } from '../utils/url-id-generator';

export default new mongoose.Schema(
  {
    _id: {
      type: String,
      default: id_gen
    },
    delivery_methods: {
      type: [String],
      default: ['live']
    },
    delivery_structure: {
      type: String,
      default: 'standard'
    },
    course_duration: {
      months: Number,
      weeks: Number,
      days: Number,
      hours: Number,
      minutes: Number
    },
    session_duration: {
      months: Number,
      weeks: Number,
      days: Number,
      hours: Number,
      minutes: Number
    },
    course_notes: String,
    instructors: {
      type: [String]
    },
    list_price: {
      type: ItemPrice,
      required: true
    },
    sessions: {
      type: [CourseDeliverySchedSessionSchema]
    },
    scheduled_runs: {
      type: [ScheduledRunSchema]
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

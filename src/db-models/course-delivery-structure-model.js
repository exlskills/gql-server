import mongoose from 'mongoose';
import ScheduledRunSchema from './scheduled-run-model';
import CourseDeliverySchedSessionSchema from './course-delivery-session-model';

export default new mongoose.Schema(
  {
    delivery_methods: {
      type: [String],
      default: ['live']
    },
    delivery_structure: {
      type: String,
      default: 'standard'
    },
    combined_duration: {
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
    instructors: {
      type: [String]
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

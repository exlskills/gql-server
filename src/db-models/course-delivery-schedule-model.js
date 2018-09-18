import mongoose from 'mongoose';
import ScheduledEventDetailsSchema from './scheduled-event-details-model';

export default new mongoose.Schema(
  {
    active: {
      type: Boolean,
      default: true
    },
    delivery_methods: {
      type: [String],
      default: ['live']
    },
    event_duration: {
      months: Number,
      weeks: Number,
      days: Number,
      hours: Number,
      minutes: Number
    },
    scheduled_event_details: {
      type: [ScheduledEventDetailsSchema]
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

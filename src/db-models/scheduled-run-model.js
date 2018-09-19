import mongoose from 'mongoose';
import SchedRunSession from './sched-run-session-model';

export default new mongoose.Schema(
  {
    _id: false,
    active: {
      type: Boolean,
      default: true
    },
    run_start_date: {
      type: Date
    },
    timezone: {
      type: String
    },
    instructors: {
      type: [String]
    },
    sessions: {
      type: [SchedRunSession]
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

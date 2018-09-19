import mongoose from 'mongoose';

export default new mongoose.Schema(
  {
    _id: false,
    session_seq: {
      type: Number
    },
    session_start_date: {
      type: Date
    },
    instructors: {
      type: [String]
    },
    session_duration: {
      months: Number,
      weeks: Number,
      days: Number,
      hours: Number,
      minutes: Number
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

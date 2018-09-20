import mongoose from 'mongoose';

export default new mongoose.Schema(
  {
    _id: false,
    session_seq: {
      type: Number
    },
    headline: String,
    desc: String,
    session_notes: String,
    instructors: {
      type: [String]
    },
    session_duration: {
      months: Number,
      weeks: Number,
      days: Number,
      hours: Number,
      minutes: Number
    },
    delivery_methods: {
      type: [String]
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

import mongoose from 'mongoose';
import { id_gen } from '../utils/url-id-generator';

export default new mongoose.Schema(
  {
    _id: {
      type: String,
      default: id_gen
    },
    session_seq: {
      type: Number
    },
    session_start_date: {
      type: Date
    },
    instructors: {
      type: [String]
    },
    session_run_notes: String,
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

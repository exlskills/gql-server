import mongoose from 'mongoose';

export default new mongoose.Schema(
  {
    _id: false,
    credits: {
      type: Number
    },
    duration_seconds: {
      type: Number
    },
    project_id: {
      type: String
    }
  }
);

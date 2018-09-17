import mongoose from 'mongoose';

export default new mongoose.Schema(
  {
    event_start_date: {
      type: Date
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

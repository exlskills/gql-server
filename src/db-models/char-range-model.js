import mongoose from 'mongoose';

export default new mongoose.Schema(
  {
    _id: false,
    start: {
      type: Number,
      required: true
    },
    end: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

import mongoose from 'mongoose';

export default new mongoose.Schema(
  {
    _id: false,
    amount: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

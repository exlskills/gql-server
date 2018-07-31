import mongoose from 'mongoose';

export default new mongoose.Schema(
  {
    _id: false,
    locale: {
      type: String,
      required: true
    },
    is_default: {
      type: Boolean,
      required: true,
      default: false
    },
    content: {
      type: String,
      required: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

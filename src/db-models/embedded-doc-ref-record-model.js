import mongoose from 'mongoose';

export default new mongoose.Schema(
  {
    level: {
      type: String,
      required: true,
      index: true
    },
    doc_id: {
      type: String,
      required: true,
      index: true
    }
  },
  {
    _id: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

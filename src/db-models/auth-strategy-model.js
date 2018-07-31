import mongoose from 'mongoose';

export default new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: new mongoose.Types.ObjectId(),
      auto: true
    },
    auth_id: {
      type: String,
      required: true
    },
    email: {
      type: String
    },
    method: {
      type: String,
      required: true
    },
    version: {
      type: String,
      required: true
    },
    payload: {
      type: Object,
      required: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

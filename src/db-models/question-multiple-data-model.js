import mongoose from 'mongoose';
import IntlStringSchema from './intl-string-model.js';

export default new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: new mongoose.Types.ObjectId(),
      auto: true
    },
    seq: {
      type: Number,
      required: true
    },
    explanation: {
      type: IntlStringSchema,
      required: true
    },
    is_answer: {
      type: Boolean,
      required: true
    },
    text: {
      type: IntlStringSchema,
      required: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

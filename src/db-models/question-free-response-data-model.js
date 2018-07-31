import mongoose from 'mongoose';
import IntlStringSchema from './intl-string-model.js';

export default new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: new mongoose.Types.ObjectId(),
      auto: true
    },
    code: {
      type: IntlStringSchema,
      required: true
    },
    code_tags: {
      type: [String],
      required: true
    },
    environment_key: {
      type: String,
      required: true
    },
    use_advanced_features: {
      type: Boolean,
      required: true
    },
    explanation: {
      type: IntlStringSchema,
      required: true
    },
    validation_code: {
      type: String,
      required: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

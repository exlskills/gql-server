import mongoose from 'mongoose';
import IntlStringSchema from './intl-string-model.js';

const QuestionFreeResponseSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: new mongoose.Types.ObjectId(),
      auto: true
    },
    api_version: {
      type: String,
      required: true
    },
    src_files: {
      type: IntlStringSchema,
      required: true
    },
    test_files: {
      type: String,
      required: true
    },
    tmpl_files: {
      type: IntlStringSchema,
      required: true
    },
    grading_strategy: {
      type: String,
      required: true
    },
    grading_tests: {
      type: String,
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
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.model(
  'QuestionFreeResponse',
  QuestionFreeResponseSchema,
  'questionfreeresonse'
);

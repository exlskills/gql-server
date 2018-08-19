import mongoose from 'mongoose';
import IntlStringSchema from './intl-string-model.js';
import { getStringByLocale } from '../parsers/intl-string-parser';
import { logger } from '../utils/logger';

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

QuestionFreeResponseSchema.statics.normalizeQuestionData = function(
  question,
  viewerLocale
) {
  logger.debug(`in QuestionFreeResponseSchema.statics.nomalizeQuestionData`);
  question.data = {
    tmpl_files: getStringByLocale(question.data.tmpl_files, viewerLocale).text,
    explanation: getStringByLocale(question.data.explanation, viewerLocale).text
  };
  return question;
};

export default mongoose.model(
  'QuestionFreeResponse',
  QuestionFreeResponseSchema,
  'questionfreeresonse'
);

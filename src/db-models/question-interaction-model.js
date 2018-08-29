import mongoose from 'mongoose';
import IntlString from './intl-string-model.js';

const QuestionInteractionSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: new mongoose.Types.ObjectId(),
      auto: true
    },
    question_id: {
      type: String,
      ref: 'Question',
      required: true,
      index: true
    },
    user_id: {
      type: String,
      ref: 'User',
      required: true,
      index: true
    },
    exam_attempt_id: {
      type: String,
      index: true
    },
    is_complete: {
      type: Boolean,
      required: true,
      default: false
    },
    result: {
      type: String,
      required: true
    },
    entered_at: {
      type: [Date],
      required: true
    },
    duration_sec: {
      type: Number
    },
    exam_type: {
      type: String
    },
    trace: {
      type: [String]
    },
    response_data: {
      type: mongoose.Schema.Types.Mixed // QuestionFreeResponseInput | []QuestionMultipleResponse
    },
    points: {
      type: Number,
      required: true
    },
    pct_score: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.model(
  'QuestionInteraction',
  QuestionInteractionSchema,
  'question_interaction'
);

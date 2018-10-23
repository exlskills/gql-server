import mongoose from 'mongoose';
import AnswerSubmission from './question-answer-submission-model';

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
    exam_session_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamSession',
      index: true
    },
    result: {
      type: String,
      required: true
    },
    entered_at: {
      type: [Date]
    },
    duration_sec: {
      type: Number
    },
    exam_type: {
      type: String,
      default: ''
    },
    trace: {
      type: [String]
    },
    // TODO - deprecate, use answer_submissions
    response_data: {
      type: mongoose.Schema.Types.Mixed // QuestionFreeResponseInput | []QuestionMultipleResponse
    },
    answer_submissions: {
      type: [AnswerSubmission]
    },
    points: {
      type: Number,
      required: true,
      default: 0
    },
    pct_score: {
      type: Number,
      required: true,
      default: 0
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

import mongoose from 'mongoose';

const ExamAttemptSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: new mongoose.Types.ObjectId(),
      auto: true
    },
    exam_id: {
      type: String,
      ref: 'Exam',
      required: true
    },
    user_id: {
      type: String,
      ref: 'User',
      required: true
    },
    unit_id: {
      type: String,
      ref: 'CourseUnit',
      required: true
    },
    question_ids: {
      type: [String],
      ref: 'Question'
    },
    question_interaction_ids: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'QuestionInteraction'
    },
    is_active: {
      type: Boolean
    },
    started_at: {
      type: Date
    },
    submitted_at: {
      type: Date
    },
    is_cancelled: {
      type: Boolean
    },
    time_limit_exceeded: {
      type: Boolean
    },
    final_grade_pct: {
      type: Number
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.model('ExamAttempt', ExamAttemptSchema, 'exam_attempt');

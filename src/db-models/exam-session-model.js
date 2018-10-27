import mongoose from 'mongoose';

const ExamSessionSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: new mongoose.Types.ObjectId(),
      auto: true
    },
    exam_id: {
      type: String,
      ref: 'Exam',
      required: true,
      index: true
    },
    user_id: {
      type: String,
      ref: 'User',
      required: true,
      index: true
    },
    unit_id: {
      type: String,
      ref: 'CourseUnit',
      required: true,
      index: true
    },
    question_ids: {
      type: [String],
      ref: 'Question'
    },
    // Need this low-cardinality index to quickly find active sessions
    is_active: {
      type: Boolean,
      required: true,
      default: true,
      index: true
    },
    started_at: {
      type: Date,
      index: true
    },
    active_till: {
      type: Date
    },
    submitted_at: {
      type: Date
    },
    time_limit_exceeded: {
      type: Boolean,
      required: true,
      default: false
    },
    final_grade_pct: {
      type: Number
    },
    is_being_graded: {
      type: Boolean,
      required: true,
      default: false
    },
    grading_failed: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.model('ExamSession', ExamSessionSchema, 'exam_session');

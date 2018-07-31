import mongoose from 'mongoose';
import { id_gen } from '../utils/url-id-generator';

const ExamSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: id_gen
    },
    creator_id: {
      type: String,
      ref: 'User',
      required: true
    },
    question_ids: {
      type: [String],
      ref: 'Question'
    },
    tags: {
      type: [String]
    },
    random_order: {
      type: Boolean,
      required: true
    },
    question_count: {
      //to do check conditions dataschema
      type: Number,
      required: true
    },
    time_limit: {
      type: Number
    },
    use_ide_test_mode: {
      type: Boolean,
      required: true
    },
    pass_mark_pct: {
      type: Number,
      required: true
    },
    est_time: {
      type: Number
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.model('Exam', ExamSchema, 'exam');

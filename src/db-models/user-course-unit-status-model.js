import mongoose from 'mongoose';

export default new mongoose.Schema(
  {
    unit_id: {
      type: String,
      required: true
    },
    quiz_lvl: {
      type: Number,
      required: true
    },
    quiz_lvl_updated_at: {
      type: Date
    },
    attempted_exam: {
      type: Boolean,
      required: true,
      default: false
    },
    attempted_exam_at: {
      type: Date
    }
  },
  {
    _id: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

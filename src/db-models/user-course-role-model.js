import mongoose from 'mongoose';

export default new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: new mongoose.Types.ObjectId(),
      auto: true
    },
    course_id: {
      type: String,
      ref: 'Course',
      required: true,
      index: true
    },
    role: {
      type: [String],
      required: true
    },
    last_accessed_at: {
      type: Date
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

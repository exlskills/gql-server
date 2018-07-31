import mongoose from 'mongoose';
import EmbeddedDocRefSchema from './embedded-doc-ref-model';
import UserCourseUnitStatus from './user-course-unit-status-model';

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
      required: true
    },
    role: {
      type: [String],
      required: true
    },
    last_accessed_at: {
      type: Date
    },
    last_accessed_item: {
      type: EmbeddedDocRefSchema
    },
    course_unit_status: {
      type: [UserCourseUnitStatus]
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

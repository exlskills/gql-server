import mongoose from 'mongoose';
import CourseUnitSchema from './course-unit-model';

export default new mongoose.Schema(
  {
    Units: {
      type: [CourseUnitSchema]
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

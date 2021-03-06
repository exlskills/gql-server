import mongoose from 'mongoose';
import CourseDeliveryStructureSchema from './course-delivery-structure-model';

const CourseDeliverySchema = new mongoose.Schema(
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
    locale: {
      type: String,
      required: true,
      default: 'en'
    },
    schedule_owner: String,
    available_delivery_methods: {
      type: [String],
      default: ['offline']
    },
    instructors: {
      type: [String]
    },
    delivery_structures: {
      type: [CourseDeliveryStructureSchema]
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

CourseDeliverySchema.index(
  {
    course_id: 1,
    locale: 1
  },
  {
    unique: true
  }
);

CourseDeliverySchema.index({
  updated_at: 1
});

export default mongoose.model(
  'CourseDelivery',
  CourseDeliverySchema,
  'course_delivery'
);

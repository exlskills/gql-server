import mongoose from 'mongoose';
import CourseDeliveryStructureSchema from './course-delivery-structure-model';

const CourseDeliverySchema = new mongoose.Schema({
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
});

export default mongoose.model(
  'CourseDelivery',
  CourseDeliverySchema,
  'course_delivery'
);

CourseDeliverySchema.index({
  'delivery_structures._id': 1,
  'delivery_structures.scheduled_runs._id': 1
});

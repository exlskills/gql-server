import mongoose from 'mongoose';
import CourseDeliveryScheduleSchema from './course-delivery-schedule-model';

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
    //    index: true
  },
  delivery_methods: {
    type: [String],
    default: ['offline']
  },
  delivery_schedule: {
    type: [CourseDeliveryScheduleSchema]
  }
});

export default mongoose.model(
  'CourseDelivery',
  CourseDeliverySchema,
  'course_delivery'
);

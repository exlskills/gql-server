import mongoose from 'mongoose';
import { id_gen } from '../utils/url-id-generator';

const CourseBadgeIssueSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: id_gen
  },
  course_id: {
    type: String,
    ref: 'Course',
    required: true,
    index: true
  },
  user_id: {
    type: String,
    ref: 'User',
    required: true,
    index: true
  },
  badge_type: {
    type: String
  },
  score: {
    type: Number
  },
  date_issued: {
    type: Date
  }
});

export default mongoose.model(
  'CourseBadgeIssue',
  CourseBadgeIssueSchema,
  'course_badge_issue'
);

CourseBadgeIssueSchema.index({
  user_id: 1,
  course_id: 1,
  badge_type: 1
});

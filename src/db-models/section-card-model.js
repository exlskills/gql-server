import mongoose from 'mongoose';
import IntlString from './intl-string-model.js';
import { id_gen } from '../utils/url-id-generator';
import CourseItemRefSchema from './course-item-ref-model';

export default new mongoose.Schema(
  {
    _id: {
      type: String,
      default: id_gen,
      index: true
    },
    index: {
      type: Number,
      required: true,
      index: true
    },
    title: {
      type: IntlString,
      required: true
    },
    headline: {
      type: IntlString,
      required: true
    },
    content_id: {
      type: String,
      required: true
    },
    tags: {
      type: [String],
      required: true
    },
    question_ids: {
      type: [String]
    },
    course_item_ref: {
      type: CourseItemRefSchema
    },
    github_edit_url: {
      type: String
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

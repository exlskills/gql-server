import mongoose from 'mongoose';
import { id_gen } from '../utils/url-id-generator';
import IntlStringSchema from './intl-string-model';
import EmbeddedDocRefSchema from './embedded-doc-ref-model';
import CourseItemRefSchema from './course-item-ref-model';

const QuestionSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: id_gen
    },
    tags: {
      type: [String],
      required: true
    },
    question_type: {
      type: String,
      required: true
    },
    question_text: {
      type: IntlStringSchema,
      required: true
    },
    data: {
      type: mongoose.Schema.Types.Mixed, // QuestionFreeReponseData | [QuestionMultipleData]
      required: true
    },
    hint: {
      type: IntlStringSchema
    },
    points: {
      type: Number,
      default: 1,
      required: true
    },
    est_time_sec: {
      type: Number,
      default: 60,
      required: true
    },
    compl_level: {
      type: Number,
      default: 1,
      required: true
    },
    course_item_ref: {
      type: CourseItemRefSchema
    },
    exam_only: {
      type: Boolean
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.model('Question', QuestionSchema, 'question');

export const QUESTION_TYPES = {
  MULT_CHOICE_SINGLE_ANSWER: 'MCSA',
  MULT_CHOICE_MULT_ANSWERS: 'MCMA',
  WRITE_SOFTWARE_CODE_QUESTION: 'WSCQ'
};

import mongoose from 'mongoose';
import { id_gen } from '../utils/url-id-generator';
import { updateIntlStringObject } from '../parsers/intl-string-parser';
import IntlStringSchema from './intl-string-model';
import EmbeddedDocRefSchema from './embedded-doc-ref-model';
import CourseItemRefSchema from './course-item-ref-model';
import { logger } from '../utils/logger';

const QuestionSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: id_gen
    },
    doc_ref: {
      type: EmbeddedDocRefSchema
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

QuestionSchema.index(
  {
    'doc_ref.EmbeddedDocRef.embedded_doc_refs.doc_id': 1,
    'course_item_ref.course_id': 1,
    'course_item_ref.unit_id': 1,
    'course_item_ref.section_id': 1,
    'course_item_ref.card_id': 1
  },
  { sparse: true }
);

// https://docs.mongodb.com/manual/core/index-sparse/#sparse-compound-indexes
// Sparse compound indexes that only contain ascending/descending index keys will index a document as long as the document contains at least one of the keys.

export default mongoose.model('Question', QuestionSchema, 'question');

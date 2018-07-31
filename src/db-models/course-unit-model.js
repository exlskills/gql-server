import mongoose from 'mongoose';
import { id_gen } from '../utils/url-id-generator';
import IntlString from './intl-string-model';
import UnitSectionObj from './unit-section-obj-model';

export default new mongoose.Schema(
  {
    _id: {
      type: String,
      default: id_gen
    },
    index: {
      type: Number,
      required: true
    },
    title: {
      type: IntlString,
      required: true
    },
    headline: {
      type: IntlString,
      required: true
    },
    sections: {
      type: UnitSectionObj
    },
    attempts_allowed_per_day: {
      type: Number,
      required: true,
      default: 1
    },
    final_exam_weight_pct: {
      type: Number,
      required: true,
      default: 10 // dummy - must be provided at loading
    },
    final_exams: {
      type: [String],
      ref: 'Exam'
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

import mongoose from 'mongoose';
import { id_gen } from '../utils/url-id-generator';
import IntlString from './intl-string-model';
import SectionCardObj from './section-card-obj-model';

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
    cards: {
      type: SectionCardObj
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

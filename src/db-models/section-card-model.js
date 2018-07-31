import mongoose from 'mongoose';
import IntlString from './intl-string-model.js';
import EmbeddedDocRef from './embedded-doc-ref-model.js';
import { id_gen } from '../utils/url-id-generator';

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
    content_id: {
      type: String,
      required: true
    },
    tags: {
      type: [String],
      required: true
    },
    question_ids: {
      type: [String],
      requrired: true
    },
    card_ref: {
      type: EmbeddedDocRef,
      required: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

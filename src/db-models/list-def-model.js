import mongoose from 'mongoose';
import { id_gen } from '../utils/url-id-generator';
import VersionedContentRecordSchema from './versioned-content-record-model.js';
import IntlStringSchema from './intl-string-model.js';

const ListDefSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: id_gen
    },
    type: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    latest_version: {
      type: Number,
      required: true
    },
    contents: {
      type: [VersionedContentRecordSchema]
    },
    desc: {
      type: IntlStringSchema
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

ListDefSchema.index(
  { 'contents.content.intlString.content': 'text' },
  { language_override: 'locale' },
  { default_language: 'none' }
);

export default mongoose.model('ListDef', ListDefSchema, 'list_def');

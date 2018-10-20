import mongoose from 'mongoose';
import { id_gen } from '../utils/url-id-generator';
import VersionedContentRecordSchema from './versioned-content-record-model.js';
import IntlStringSchema from './intl-string-model.js';

const ListDefSchema = new mongoose.Schema(
  {
    // Note: ObjectID must be used when non-mongoose maintenance may be taking place, e.g., manual records entry
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: new mongoose.Types.ObjectId(),
      auto: true
    },
    type: {
      type: String,
      required: true,
      index: true
    },
    value: {
      type: String,
      required: true,
      index: true
    },
    // This should be used for basic fixed texts that would not require versioning
    desc: {
      type: IntlStringSchema
    },
    // This is used for template-like texts and therefore is set with versioning
    contents: {
      type: [VersionedContentRecordSchema]
    },
    latest_version: {
      type: Number,
      required: true,
      default: 1
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

ListDefSchema.index(
  {
    'contents.content.intlString.content': 'text',
    'desc.intlString.content': 'text'
  },
  { language_override: 'locale' },
  { default_language: 'none' }
);

// Also a UNIQUE compound index on type:1 and value:1

export default mongoose.model('ListDef', ListDefSchema, 'list_def');

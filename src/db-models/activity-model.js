import mongoose from 'mongoose';
import IntlStringSchema from './intl-string-model';
import EmbeddedDocRefSchema from './embedded-doc-ref-model';

const ActivitySchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: new mongoose.Types.ObjectId(),
      auto: true
    },
    date: {
      type: Date,
      required: true
    },
    user_id: {
      type: String,
      ref: 'User',
      required: true
    },
    def_id: {
      type: String,
      ref: 'ListDef',
      required: true
    },
    activity_link: {
      type: String,
      required: true
    },
    doc_ref: {
      type: EmbeddedDocRefSchema
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.model('Activity', ActivitySchema, 'activity');

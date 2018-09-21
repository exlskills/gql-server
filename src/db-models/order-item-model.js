import mongoose from 'mongoose';
import { id_gen } from '../utils/url-id-generator';
import EmbeddedDocRefRecord from './embedded-doc-ref-record-model';

export default new mongoose.Schema(
  {
    _id: {
      type: String,
      default: id_gen
    },
    item_category: {
      type: String,
      required: true
    },
    item_id: {
      type: [EmbeddedDocRefRecord],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      default: 0
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

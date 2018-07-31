import mongoose from 'mongoose';
import EmbeddedDocRefRecord from './embedded-doc-ref-record-model.js';

const EmbeddedDocRef = new mongoose.Schema(
  {
    _id: false,
    embedded_doc_refs: {
      type: [EmbeddedDocRefRecord]
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default new mongoose.Schema(
  {
    _id: false,
    EmbeddedDocRef: {
      type: EmbeddedDocRef
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

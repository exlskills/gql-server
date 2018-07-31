import mongoose from 'mongoose';
import IntlStringRecord from './intl-string-record-model.js';

export default new mongoose.Schema(
  {
    _id: false,
    intlString: {
      type: [IntlStringRecord]
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

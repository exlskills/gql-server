import mongoose from 'mongoose';
import IntlStringSchema from './intl-string-model';

export default new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: new mongoose.Types.ObjectId(),
      auto: true
    },
    actor: {
      type: String,
      required: true,
      ref: 'User'
    },
    notification_link: {
      type: String,
      required: true
    },
    def_id: {
      type: String,
      required: true,
      ref: 'ListDef'
    },
    is_read: {
      type: Boolean,
      required: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

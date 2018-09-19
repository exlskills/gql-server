import mongoose from 'mongoose';
import { id_gen } from '../src/utils/url-id-generator';
import IntlStringSchema from '../src/db-models/intl-string-model';

/**
 * User Schema
 */
const UserSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: id_gen
    },
    full_name: {
      type: IntlStringSchema,
      index: true
    },
    username: {
      type: String,
      index: true
    },
    primary_email: {
      type: String,
      index: true
    },
    is_demo: {
      type: Boolean,
      required: true,
      default: false
    },
    has_completed_first_tutorial: {
      type: Boolean,
      required: true,
      default: false
    },
    primary_locale: {
      type: String,
      default: 'en',
      required: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.model('User', UserSchema, 'user');

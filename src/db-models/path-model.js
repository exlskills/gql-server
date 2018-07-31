import mongoose from 'mongoose';
import { id_gen } from '../utils/url-id-generator';
import IntlStringSchema from './intl-string-model';

const PathSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: id_gen
    },
    title: {
      type: IntlStringSchema,
      required: true
    },
    headline: {
      type: IntlStringSchema,
      required: true
    },
    description: {
      type: IntlStringSchema,
      required: true
    },
    organization_ids: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Organization'
    },
    primary_locale: {
      type: String
    },
    logo_url: {
      type: String,
      required: true
    },
    cover_url: {
      type: String,
      required: true
    },
    is_published: {
      type: Boolean,
      required: true,
      default: false
    },
    is_organization_only: {
      type: Boolean,
      required: true,
      default: false
    },
    subscription_level: {
      type: Number,
      required: true,
      default: 1
    },
    courses: {
      type: [String]
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.model('Path', PathSchema, 'path');

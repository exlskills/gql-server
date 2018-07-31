import mongoose from 'mongoose';
import IntlStringSchema from './intl-string-model';

const OrganizationSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: new mongoose.Types.ObjectId(),
      auto: true
    },
    name: {
      type: IntlStringSchema,
      required: true
    },
    headline: {
      type: IntlStringSchema,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    description: {
      type: IntlStringSchema,
      required: true
    },
    primary_locale: {
      type: String,
      required: true
    },
    avatar_url: {
      // set to default by the server
      type: String,
      required: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.model(
  'Organization',
  OrganizationSchema,
  'organization'
);

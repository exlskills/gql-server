import mongoose from 'mongoose';
import { id_gen } from '../utils/url-id-generator';

const OrganizationInviteSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: id_gen
    },
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },
    email: {
      type: String,
      required: true
    },
    role: {
      type: String
    },
    status: {
      type: String,
      required: true
    },
    claimed_at: {
      type: Date
    },
    expires_at: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.model(
  'OrganizationInvite',
  OrganizationInviteSchema,
  'organization_invite'
);

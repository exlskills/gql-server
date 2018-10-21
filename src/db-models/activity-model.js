import mongoose from 'mongoose';
import ActivityLinkRefSchema from './activity-link-ref-model';

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
      required: true,
      index: true
    },
    listdef_value: {
      type: String,
      ref: 'ListDef',
      required: true,
      index: true
    },
    activity_link: {
      type: String,
      required: true
    },
    activity_link_ref: {
      type: ActivityLinkRefSchema
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.model('Activity', ActivitySchema, 'activity');

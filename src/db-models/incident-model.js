import mongoose from 'mongoose';

const IncidentSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: new mongoose.Types.ObjectId(),
      auto: true
    },
    user_id: {
      type: String,
      ref: 'User',
      required: true,
      index: true
    },
    incident_type: {
      type: String,
      required: true,
      index: true
    },
    incident_desc: {
      type: String
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.model('Incident', IncidentSchema, 'incident');

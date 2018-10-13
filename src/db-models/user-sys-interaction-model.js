import mongoose from 'mongoose';

const UserSysInteractionSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: new mongoose.Types.ObjectId(),
    auto: true
  },
  user_id: {
    type: String,
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true
  },
  object: {
    type: String
  },
  object_to: {
    type: String
  },
  recorded_at: {
    type: Date
  }
});

export default mongoose.model(
  'UserSysInteraction',
  UserSysInteractionSchema,
  'user_sys_interaction'
);

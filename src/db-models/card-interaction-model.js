import mongoose from 'mongoose';
import CardActionSchema from './card-action-model';
import CourseItemRefSchema from './course-item-ref-model';

const CardInteractionSchema = new mongoose.Schema(
  {
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
    card_id: {
      type: String,
      required: true,
      index: true
    },
    course_item_ref: {
      type: CourseItemRefSchema
    },
    // Note, only last action is recorded
    action: {
      type: CardActionSchema,
      required: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.model(
  'CardInteraction',
  CardInteractionSchema,
  'card_interaction'
);

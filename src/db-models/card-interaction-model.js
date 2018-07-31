import mongoose from 'mongoose';
import EmbeddedDocRefSchema from './embedded-doc-ref-model';
import CardActionSchema from './card-action-model';

const CardInteractionSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: new mongoose.Types.ObjectId(),
      auto: true
    },
    user_id: {
      type: String,
      required: true
    },
    card_id: {
      type: String,
      required: true
    },
    card_ref: {
      type: EmbeddedDocRefSchema,
      required: true
    },
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

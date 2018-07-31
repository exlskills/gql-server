import mongoose from 'mongoose';
import SectionCard from './section-card-model';

export default new mongoose.Schema(
  {
    Cards: {
      type: [SectionCard]
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

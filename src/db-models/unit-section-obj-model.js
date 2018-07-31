import mongoose from 'mongoose';
import UnitSection from './unit-section-model.js';

export default new mongoose.Schema(
  {
    Sections: {
      type: [UnitSection]
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

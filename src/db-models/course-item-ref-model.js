import mongoose from 'mongoose';

export default new mongoose.Schema(
  {
    course_id: {
      type: String
    },
    unit_id: {
      type: String
    },
    section_id: {
      type: String
    },
    card_id: {
      type: String
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

import mongoose from 'mongoose';

export default new mongoose.Schema(
  {
    _id: false,
    level: {
      type: Number,
      default: 0,
      required: true
    }
    //to do payment fields? duration free trials...
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

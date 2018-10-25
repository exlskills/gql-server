import mongoose from 'mongoose';

export default new mongoose.Schema({
  _id: false,
  course_id: {
    type: String,
    index: { sparse: true }
  },
  unit_id: {
    type: String,
    index: { sparse: true }
  },
  section_id: {
    type: String,
    index: { sparse: true }
  },
  card_id: {
    type: String,
    index: { sparse: true }
  }
});

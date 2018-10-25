import mongoose from 'mongoose';

export default new mongoose.Schema({
  action: {
    type: String,
    enum: [
      'view', // View card in the normal learning flow
      'view_d', // View card from Discussion link
      'answ_c', // Correctly answered
      'answ_ic', // Incorrectly answered
      'skip', // Skipped actively - TBD
      'fwd', // Move forward without answering
      'bck', // Move backwards without answering
      'bck_cw', // Move back to Course view
      'hint' // Clicked Show hint
    ]
  },
  recorded_at: {
    type: Date
  }
});

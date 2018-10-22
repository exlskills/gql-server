import mongoose from 'mongoose';

export default new mongoose.Schema({
  _id: false,
  submitted_at: Date,
  response_data: {
    type: mongoose.Schema.Types.Mixed // QuestionFreeResponseInput | []QuestionMultipleResponse
  }
});

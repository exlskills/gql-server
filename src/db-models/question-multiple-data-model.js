import mongoose from 'mongoose';
import IntlStringSchema from './intl-string-model.js';
import {getStringByLocale} from "../parsers/intl-string-parser";

const QuestionMultipleSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: new mongoose.Types.ObjectId(),
      auto: true
    },
    seq: {
      type: Number,
      required: true
    },
    explanation: {
      type: IntlStringSchema,
      required: true
    },
    is_answer: {
      type: Boolean,
      required: true
    },
    text: {
      type: IntlStringSchema,
      required: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

QuestionMultipleSchema.statics.nomalizeQuestionData = function(
  question,
  viewerLocale
) {
  console.log(`in QuestionMultipleSchema.statics.nomalizeQuestionData`);
  question.data = {
    _id: question._id,
    options: question.data.map(item => ({
      _id: item._id,
      seq: item.seq,
      text: getStringByLocale(item.text, viewerLocale).text,
      is_answer: item.is_answer,
      explanation: getStringByLocale(item.explanation, viewerLocale).text
    }))
  };

  return question;
};

export default mongoose.model(
  'QuestionMultiple',
  QuestionMultipleSchema,
  'questionmultiple'
);

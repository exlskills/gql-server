import mongoose from 'mongoose';
import { id_gen } from '../utils/url-id-generator';
import {
  getStringByLocale,
  updateIntlStringObject
} from '../parsers/intl-string-parser';
import IntlStringSchema from './intl-string-model';
import EmbeddedDocRefSchema from './embedded-doc-ref-model';

const QuestionSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: id_gen
    },
    doc_ref: {
      type: EmbeddedDocRefSchema
    },
    tags: {
      type: [String],
      required: true
    },
    question_type: {
      type: String,
      required: true
    },
    question_text: {
      type: IntlStringSchema,
      required: true
    },
    data: {
      type: mongoose.Schema.Types.Mixed, // QuestionFreeReponseData | [QuestionMultipleData]
      required: true
    },
    hint: {
      type: IntlStringSchema
    },
    points: {
      type: Number,
      default: 1,
      required: true
    },
    est_time_sec: {
      type: Number,
      default: 60,
      required: true
    },
    compl_level: {
      type: Number,
      default: 1,
      required: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

QuestionSchema.statics.nomalizeQuestionData = (question, viewerLocale) => {
  question.question_text = getStringByLocale(
    question.question_text,
    viewerLocale
  ).text;
  question.hint = getStringByLocale(question.hint, viewerLocale).text;

  if (question.question_type == 'MCSA' || question.question_type == 'MCMA') {
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
  } else if (question.question_type == 'WSCQ') {
    question.data.code = getStringByLocale(
      question.data.code,
      viewerLocale
    ).text;
    question.data.explanation = getStringByLocale(
      question.data.explanation,
      viewerLocale
    ).text;
  }
  return question;
};

QuestionSchema.methods.updateInfo = async function(data, viewerLocale) {
  if ('tags' in data) {
    this.tags = data.tags;
  }
  if ('points' in data) {
    this.points = data.points;
  }
  if ('est_time_sec' in data) {
    this.est_time_sec = data.est_time_sec;
  }
  if ('compl_level' in data) {
    this.compl_level = data.compl_level;
  }
  if ('hint' in data) {
    this.hint = updateIntlStringObject(this.hint, viewerLocale, data.hint);
  }
  if ('question_text' in data) {
    this.question_text = updateIntlStringObject(
      this.question_text,
      viewerLocale,
      data.question_text
    );
  }

  if ('data' in data) {
    const answerData = data.data;
    if (this.question_type == 'MCSA' || this.question_type == 'MCMA') {
      if (answerData.options && answerData.options.length > 0) {
        for (let opt of answerData.options) {
          let quesOpt = this.data.find(item => item._id.toString() == opt.id);
          if (!quesOpt) {
            continue;
          }
          if ('is_answer' in opt) {
            quesOpt.is_answer = opt.is_answer;
          }
          if ('seq' in opt) {
            quesOpt.seq = opt.seq;
          }
          if ('explanation' in opt) {
            quesOpt.explanation = updateIntlStringObject(
              quesOpt.explanation,
              viewerLocale,
              opt.explanation
            );
          }
          if ('text' in opt) {
            quesOpt.text = updateIntlStringObject(
              quesOpt.text,
              viewerLocale,
              opt.text
            );
          }
        }
        this.markModified('data');
      }
    } else if (this.question_type == 'WSCQ') {
      if (answerData) {
        if ('code' in answerData) {
          this.data.code = updateIntlStringObject(
            this.data.code,
            viewerLocale,
            answerData.code
          );
        }
        if ('explanation' in answerData) {
          this.data.explanation = updateIntlStringObject(
            this.data.explanation,
            viewerLocale,
            answerData.explanation
          );
        }
        if ('code_tags' in answerData) {
          this.data.code_tags = answerData.code_tags;
        }
        if ('environment_key' in answerData) {
          this.data.environment_key = answerData.environment_key;
        }
        if ('use_advanced_features' in answerData) {
          this.data.use_advanced_features = answerData.use_advanced_features;
        }
        if ('validation_code' in answerData) {
          this.data.validation_code = answerData.validation_code;
        }
      }
    }
  }

  return await this.save();
};

export default mongoose.model('Question', QuestionSchema, 'question');

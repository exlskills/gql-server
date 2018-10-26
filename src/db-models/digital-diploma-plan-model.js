import mongoose from 'mongoose';
import { id_gen } from '../utils/url-id-generator';
import IntlString from './intl-string-model';

export default new mongoose.Schema(
  {
    _id: {
      type: String,
      default: id_gen
    },
    title: {
      type: IntlString,
      required: true
    },
    headline: {
      type: IntlString,
      required: true
    },
    cost: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

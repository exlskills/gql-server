import mongoose from 'mongoose';
import { id_gen } from '../utils/url-id-generator';
import { getStringByLocale } from '../parsers/intl-string-parser';
import VersionedContentRecordSchema from './versioned-content-record-model.js';

const VersionedContentSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: id_gen
    },
    latest_version: {
      type: Number,
      required: true
    },
    contents: {
      type: [VersionedContentRecordSchema]
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

VersionedContentSchema.methods.updateContent = async function(newText, locale) {
  if (!newText) {
    return this;
  }
  const lastContent = this.contents.sort((a, b) => b.version - a.version)[0];
  const oldText = getStringByLocale(lastContent.content, locale).text;

  if (oldText !== newText) {
    const newContent = {
      version: lastContent.version + 1,
      content: { intlString: [{ content: newText, locale, is_default: true }] }
    };

    this.contents.push(newContent);
    this.latest_version = newContent.version;
    await this.save();
  }
  return this;
};

export default mongoose.model(
  'VersionedContent',
  VersionedContentSchema,
  'versioned_content'
);

import mongoose from 'mongoose';
import { id_gen } from '../utils/url-id-generator';
import IntlStringSchema from './intl-string-model';
import DigitalDiplomaPlanSchema from './digital-diploma-plan-model';
import InstructorTimekitSchema from './instructor-timekit-model';

const DigitalDiplomaSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: id_gen
    },
    title: {
      type: IntlStringSchema,
      required: true
    },
    headline: {
      type: IntlStringSchema,
      required: true
    },
    description: {
      type: IntlStringSchema,
      required: true
    },
    primary_locale: {
      type: String
    },
    logo_url: {
      type: String,
      required: true
    },
    cover_url: {
      type: String,
      required: true
    },
    is_published: {
      type: Boolean,
      required: true,
      default: false
    },
    topics: {
      type: [String],
      index: true
    },
    info_md: {
      type: IntlStringSchema,
      required: false
    },
    skill_level: {
      type: Number,
      required: true,
      default: '1'
    },
    est_minutes: {
      type: Number,
      required: true,
      default: 60
    },
    primary_topic: {
      type: String,
      required: true,
      default: 'Java'
    },
    instructor_timekit: {
      type: InstructorTimekitSchema
    },
    plans: {
      type: [DigitalDiplomaPlanSchema]
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

DigitalDiplomaSchema.index(
  {
    'title.intlString.content': 'text'
  },
  {
    language_override: 'locale'
  }
);

export default mongoose.model('DigitalDiploma', DigitalDiplomaSchema, 'digital_diploma');

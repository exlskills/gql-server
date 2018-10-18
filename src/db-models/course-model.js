import mongoose from 'mongoose';
import { id_gen } from '../utils/url-id-generator';
import IntlStringSchema from './intl-string-model';
import CourseUnitObjSchema from './course-unit-obj-model';

const CourseSchema = new mongoose.Schema(
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
    organization_ids: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Organization'
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
    is_organization_only: {
      type: Boolean,
      required: true,
      default: false
    },
    subscription_level: {
      type: Number,
      required: true,
      default: 1
    },
    units: {
      type: CourseUnitObjSchema
    },
    topics: {
      type: [String],
      index: true
    },
    enrolled_count: {
      type: Number,
      required: true
    },
    view_count: {
      type: Number,
      required: true
    },
    info_md: {
      type: IntlStringSchema,
      required: false
    },
    repo_url: {
      type: String,
      required: false,
      default: null
    },
    verified_cert_cost: {
      type: Number,
      required: false,
      default: null
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
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

CourseSchema.index(
  {
    'title.intlString.content': 'text',
    'units.Units._id': 1
  },
  {
    language_override: 'locale'
  }
);

export default mongoose.model('Course', CourseSchema, 'course');

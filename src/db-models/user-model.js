import mongoose from 'mongoose';
import { id_gen } from '../utils/url-id-generator';
import UserCourseRoleSchema from './user-course-role-model';
import UserSubscriptionSchema from './user-subscription-model';
import AuthStrategySchema from './auth-strategy-model';
import UserOrganizationRoleSchema from './user-organization-role-model';
import IntlStringSchema from './intl-string-model';

/**
 * User Schema
 */
const UserSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: id_gen
    },
    full_name: {
      type: IntlStringSchema
    },
    headline: {
      type: IntlStringSchema
    },
    username: {
      type: String,
      index: true
    },
    primary_email: {
      type: String,
      index: true
    },
    secondary_emails: {
      type: [String]
    },
    biography: {
      type: IntlStringSchema
    },
    is_demo: {
      type: Boolean,
      required: true,
      default: true,
      index: true
    },
    is_instructor: {
      type: Boolean,
      required: true,
      default: false,
      index: true
    },
    has_completed_first_tutorial: {
      type: Boolean,
      required: true,
      default: false
    },
    primary_locale: {
      type: String,
      default: 'en',
      required: true
    },
    locales: {
      type: [String]
    },
    subscription: {
      type: [UserSubscriptionSchema],
      default: []
    },
    avatar_url: {
      type: String,
      required: true,
      default: ' '
    },
    is_verified: {
      type: Boolean,
      required: true,
      default: false
    },
    auth_strategies: {
      type: [AuthStrategySchema],
      default: []
    },
    organization_roles: {
      type: [UserOrganizationRoleSchema],
      default: []
    },
    course_roles: {
      type: [UserCourseRoleSchema],
      default: []
    },
    zoho_customer_id: {
      type: String,
      index: true
    },
    zoho_ccy_code: {
      type: String
    },
    instructor_topics: {
      // "en" values. Each must match list_def.value where list_def.type='instructor_topic'
      // list_def.desc contains non-"en" values by locale
      type: [String],
      index: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

UserSchema.index(
  {
 //    'full_name.intlString.content': 1,
    'headline.intlString.content': 'text',
    'biography.intlString.content': 'text'
  },
  { language_override: 'locale' },
  {
    default_language: 'none'
  }
);

export default mongoose.model('User', UserSchema, 'user');

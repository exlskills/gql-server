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
      type: IntlStringSchema,
      index: true
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
      default: true
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
      required: true
    },
    avatar_url: {
      type: String,
      required: true
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
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

UserSchema.index({
  'auth_strategies.auth_id': 1
});

export default mongoose.model('User', UserSchema, 'user');

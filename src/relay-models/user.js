import {
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  globalIdField
} from 'graphql-relay';

import getUserInfo from '../relay-queries/get-user-info';

import { AuthStrategyConnection } from './auth-strategy';
import { UserSubscriptionConnection } from './user-subscription';
import { UserOrganizationRoleConnection } from './user-organization-role';
import { UserCourseRoleConnection } from './user-course-role';

import { NodeInterface } from './node-definitions';

export const UserType = new GraphQLObjectType({
  name: 'User',
  description: 'Application user',
  fields: () => ({
    id: globalIdField('User', obj => obj._id),
    full_name: {
      type: GraphQLString
    },
    username: {
      type: GraphQLString
    },
    primary_email: {
      type: GraphQLString
    },
    pwd: {
      type: GraphQLString
    },
    secondary_emails: {
      type: new GraphQLList(GraphQLString)
    },
    biography: {
      type: GraphQLString
    },
    is_demo: {
      type: GraphQLBoolean
    },
    headline: {
      type: GraphQLString
    },
    has_completed_first_tutorial: {
      type: GraphQLBoolean
    },
    locales: {
      type: new GraphQLList(GraphQLString),
      resolve: obj => (obj && obj.locales ? obj.locales : [])
    },
    primary_locale: {
      type: new GraphQLNonNull(GraphQLString)
    },
    subscription: {
      type: UserSubscriptionConnection
    },
    avatar_url: {
      type: GraphQLString
    },
    is_verified: {
      type: GraphQLBoolean
    },
    auth_strategies: {
      type: AuthStrategyConnection,
      args: connectionArgs,
      resolve: (user, args) =>
        connectionFromArray(getUserInfo.getAuthStrategies(user), args)
    },
    organization_roles: {
      type: UserOrganizationRoleConnection,
      args: connectionArgs,
      resolve: (user, args) =>
        connectionFromArray(getUserInfo.getOrganizationRoles(user), args)
    },
    course_roles: {
      type: UserCourseRoleConnection,
      args: connectionArgs,
      // need to wrap it to an array because we unwind it in the queries
      // resolve: (user, args) => connectionFromArray(getUserInfo.getCourseRoles(user), args) //works for mostRecentCourses but not all Users
      resolve: (user, args) =>
        connectionFromArray(getUserInfo.getCourseRoles(user), args)
    }
  }),
  interfaces: [NodeInterface]
});

export const { connectionType: UserConnection } = connectionDefinitions({
  name: 'User',
  nodeType: UserType
});

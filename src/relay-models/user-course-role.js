import {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import { connectionDefinitions, globalIdField } from 'graphql-relay';

import { NodeInterface } from './node-definitions';

export const UserCourseRoleType = new GraphQLObjectType({
  name: 'UserCourseRole',
  description: 'Defines a users role in a course',
  fields: () => ({
    id: globalIdField('UserCourseRole', obj => obj._id),
    course_id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    role: {
      type: new GraphQLNonNull(new GraphQLList(GraphQLString))
    },
    last_accessed_at: {
      type: GraphQLString
    }
  }),
  interfaces: [NodeInterface]
});

export const {
  connectionType: UserCourseRoleConnection
} = connectionDefinitions({
  name: 'UserCourseRole',
  nodeType: UserCourseRoleType
});

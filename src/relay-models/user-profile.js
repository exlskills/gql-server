import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';
import { globalIdField } from 'graphql-relay';

import { NodeInterface } from './node-definitions';

export const UserProfileType = new GraphQLObjectType({
  name: 'UserProfile',
  description: 'User profile field only',
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
    biography: {
      type: GraphQLString
    },
    headline: {
      type: GraphQLString
    },
    locales: {
      type: new GraphQLList(GraphQLString),
      resolve: obj => (obj && obj.locales ? obj.locales : [])
    },
    primary_locale: {
      type: new GraphQLNonNull(GraphQLString)
    },
    avatar_url: {
      type: new GraphQLNonNull(GraphQLString)
    }
  }),
  interfaces: [NodeInterface]
});

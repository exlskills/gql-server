import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import { connectionDefinitions, globalIdField } from 'graphql-relay';

import { NodeInterface } from './node-definitions';

export const ActivityType = new GraphQLObjectType({
  name: 'Activity',
  description: '',
  fields: () => ({
    id: globalIdField('Activity', obj => obj._id),
    user_id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    date: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: obj => obj.date.toISOString()
    },
    def_value: {
      type: new GraphQLNonNull(GraphQLString)
    },
    activity_link: {
      type: new GraphQLNonNull(GraphQLString)
    },
    type: {
      type: new GraphQLNonNull(GraphQLString)
    },
    type_desc: {
      type: GraphQLString
    },
    content: {
      type: new GraphQLNonNull(GraphQLString)
    }
  }),
  interfaces: [NodeInterface]
});

export const { connectionType: ActivityConnection } = connectionDefinitions({
  name: 'Activity',
  nodeType: ActivityType
});

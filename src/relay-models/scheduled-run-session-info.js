import { GraphQLInt, GraphQLObjectType, GraphQLString } from 'graphql';
import { globalIdField } from 'graphql-relay';
import { NodeInterface } from './node-definitions';

export const ScheduledRunSessionInfoType = new GraphQLObjectType({
  name: 'ScheduledRunSessionInfoType',
  description: 'Scheduled Run Session Info',
  fields: () => ({
    id: globalIdField('ScheduledRunSessionInfo', obj => obj.session_seq),
    session_seq: {
      type: GraphQLInt
    },
    headline: {
      type: GraphQLString
    },
    desc: {
      type: GraphQLString
    },
    session_notes: {
      type: GraphQLString
    }
  }),
  interfaces: [NodeInterface]
});

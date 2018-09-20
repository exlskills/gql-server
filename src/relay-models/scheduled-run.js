import { GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import { GraphQLDateTime } from 'graphql-iso-date';
import { globalIdField } from 'graphql-relay';
import { NodeInterface } from './node-definitions';
import { ScheduledRunSessionType } from './sched-run-session';

export const ScheduledRunType = new GraphQLObjectType({
  name: 'ScheduledRunType',
  description: 'Scheduled Run Details',
  fields: () => ({
    id: globalIdField('ScheduledRunDetails', obj => obj._id),
    run_start_date: {
      type: GraphQLDateTime
    },
    _id: {
      type: GraphQLString
    },
    run_sessions: {
      type: new GraphQLList(ScheduledRunSessionType)
    }
  }),
  interfaces: [NodeInterface]
});

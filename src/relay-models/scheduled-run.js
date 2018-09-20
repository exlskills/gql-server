import { GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import { GraphQLDateTime } from 'graphql-iso-date';
import { globalIdField } from 'graphql-relay';
import { NodeInterface } from './node-definitions';
import { ScheduledRunSessionType } from './sched-run-session';
import { ItemPriceType } from './item-price';

export const ScheduledRunType = new GraphQLObjectType({
  name: 'ScheduledRunType',
  description: 'Scheduled Run',
  fields: () => ({
    id: globalIdField('ScheduledRun', obj => obj._id),
    run_start_date: {
      type: GraphQLDateTime
    },
    _id: {
      type: GraphQLString
    },
    offered_at_price: {
      type: ItemPriceType
    },
    run_sessions: {
      type: new GraphQLList(ScheduledRunSessionType)
    }
  }),
  interfaces: [NodeInterface]
});

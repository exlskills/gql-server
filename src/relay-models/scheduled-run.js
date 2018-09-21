import {
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean
} from 'graphql';
import { GraphQLDateTime } from 'graphql-iso-date';
import { globalIdField } from 'graphql-relay';
import { NodeInterface } from './node-definitions';
import { ScheduledRunSessionType } from './sched-run-session';
import { ItemPriceType } from './item-price';
import { resolveUserSeatPurchased } from '../relay-resolvers/course-delivery-schedule-resolvers';

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
    },
    seat_purchased: {
      type: GraphQLBoolean,
      resolve: (obj, args, viewer, info) =>
        resolveUserSeatPurchased(obj, args, viewer, info)
    }
  }),
  interfaces: [NodeInterface]
});

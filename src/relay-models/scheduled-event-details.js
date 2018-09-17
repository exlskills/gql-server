import { GraphQLObjectType } from 'graphql';
import { GraphQLDateTime } from 'graphql-iso-date';
import { globalIdField } from 'graphql-relay';
import { NodeInterface } from './node-definitions';

export const ScheduledEventDetails = new GraphQLObjectType({
  name: 'ScheduledEventDetails',
  description: 'Scheduled Event Details',
  fields: () => ({
    id: globalIdField('ScheduledEventDetails', obj => obj._id),
    event_start_date: {
      type: GraphQLDateTime
    }
  }),
  interfaces: [NodeInterface]
});

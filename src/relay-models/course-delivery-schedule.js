import {
  GraphQLBoolean,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';
import { globalIdField } from 'graphql-relay';
import { NodeInterface } from './node-definitions';
import { ScheduledEventDetails } from './scheduled-event-details';

export const CourseDeliverySchedule = new GraphQLObjectType({
  name: 'CourseDeliverySchedule',
  description: 'Course Delivery Schedule',
  fields: () => ({
    id: globalIdField('CourseDeliverySchedule', obj => obj._id),
    active: {
      type: GraphQLBoolean
    },
    delivery_methods: {
      type: new GraphQLList(GraphQLString)
    },
    scheduled_event_details: {
      type: new GraphQLList(ScheduledEventDetails)
    }
  }),
  interfaces: [NodeInterface]
});

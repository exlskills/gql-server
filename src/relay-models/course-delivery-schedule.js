import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';
import { connectionDefinitions, globalIdField } from 'graphql-relay';
import { NodeInterface } from './node-definitions';
import { ScheduledEventDetails } from './scheduled-event-details';

export const CourseDeliveryScheduleType = new GraphQLObjectType({
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
    event_duration: {
      type: EventDurationType
    },
    scheduled_event_details: {
      type: new GraphQLList(ScheduledEventDetails)
    }
  }),
  interfaces: [NodeInterface]
});

export const {
  connectionType: CourseDeliveryScheduleConnection
} = connectionDefinitions({
  name: 'CourseDeliverySchedule',
  nodeType: CourseDeliveryScheduleType
});

const EventDurationType = new GraphQLObjectType({
  name: 'EventDuration',
  description: 'Event Duration',
  fields: () => ({
    months: {
      type: GraphQLInt
    },
    weeks: {
      type: GraphQLInt
    },
    days: {
      type: GraphQLInt
    },
    hours: {
      type: GraphQLInt
    },
    minutes: {
      type: GraphQLInt
    }
  })
});

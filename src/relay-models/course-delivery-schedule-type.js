import {
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';
import { connectionDefinitions, globalIdField } from 'graphql-relay';
import { NodeInterface } from './node-definitions-type';
import { ScheduledRunType } from './scheduled-run-type';
import { EventDurationType } from './event-duration-type';
import { ScheduledRunSessionInfoType } from './scheduled-run-session-info-type';

export const CourseDeliveryScheduleType = new GraphQLObjectType({
  name: 'CourseDeliverySchedule',
  description: 'Course Delivery Schedule',
  fields: () => ({
    id: globalIdField('CourseDeliverySchedule', obj => obj._id),
    _id: {
      type: GraphQLString
    },
    delivery_methods: {
      type: new GraphQLList(GraphQLString)
    },
    delivery_structure: {
      type: GraphQLString
    },
    course_duration: {
      type: EventDurationType
    },
    course_notes: {
      type: GraphQLString
    },
    session_info: {
      type: new GraphQLList(ScheduledRunSessionInfoType)
    },
    scheduled_runs: {
      type: new GraphQLList(ScheduledRunType)
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

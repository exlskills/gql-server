import {
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';
import { connectionDefinitions, globalIdField } from 'graphql-relay';
import { NodeInterface } from './node-definitions';
import { ScheduledRunType } from './scheduled-run';
import { EventDurationType } from './event-duration';

export const CourseDeliveryScheduleType = new GraphQLObjectType({
  name: 'CourseDeliverySchedule',
  description: 'Course Delivery Schedule',
  fields: () => ({
    id: globalIdField('CourseDeliverySchedule', obj => obj._id),
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

const ScheduledRunSessionInfoType = new GraphQLObjectType({
  name: 'ScheduledRunSessionInfoType',
  description: 'Scheduled Run Session Info',
  fields: () => ({
    id: globalIdField('ScheduledRunSessionInfo', obj => obj._id),
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

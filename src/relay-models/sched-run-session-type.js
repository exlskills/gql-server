import {
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt
} from 'graphql';
import { globalIdField } from 'graphql-relay';
import { GraphQLDateTime } from 'graphql-iso-date';
import { NodeInterface } from './node-definitions-type';
import { EventDurationType } from './event-duration-type';

export const ScheduledRunSessionType = new GraphQLObjectType({
  name: 'ScheduledRunSessionType',
  description: 'Scheduled Run Session',
  fields: () => ({
    id: globalIdField('ScheduledRunSession', obj => obj._id),
    session_seq: {
      type: GraphQLInt
    },
    session_start_date: {
      type: GraphQLDateTime
    },
    _id: {
      type: GraphQLString
    },
    session_run_notes: {
      type: GraphQLString
    },
    instructors: {
      type: new GraphQLList(SessionInstructorType)
    },
    session_duration: {
      type: EventDurationType
    }
  }),
  interfaces: [NodeInterface]
});

const SessionInstructorType = new GraphQLObjectType({
  name: 'SessionInstructorType',
  description: 'Session Instructor',
  fields: () => ({
    id: globalIdField('SessionInstructor', obj => obj._id),
    _id: {
      type: GraphQLString
    },
    full_name: {
      type: GraphQLString
    },
    username: {
      type: GraphQLString
    },
    avatar_url: {
      type: GraphQLString
    },
    headline: {
      type: GraphQLString
    },
    biography: {
      type: GraphQLString
    }
  }),
  interfaces: [NodeInterface]
});

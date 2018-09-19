import { GraphQLString } from 'graphql';
import { GraphQLDateTime } from 'graphql-iso-date';
import { resolveCourseDeliverySchedule } from '../../../relay-resolvers/course-delivery-schedule-resolvers';
import { CourseDeliveryScheduleType } from '../../../relay-models/course-delivery-schedule';

export default {
  type: CourseDeliveryScheduleType,
  args: {
    course_id: {
      type: GraphQLString
    },
    delivery_method: {
      type: GraphQLString
    },
    date_on_or_after: {
      type: GraphQLDateTime
    }
  },
  resolve: (obj, args, viewer, info) =>
    resolveCourseDeliverySchedule(obj, args, viewer, info)
};

import { GraphQLString } from 'graphql';
import { resolveCourseUnitSummary } from '../../../relay-resolvers/course-resolvers';
import { CourseType } from '../../../relay-models/course';

export default {
  type: CourseType,
  args: {
    course_id: {
      type: GraphQLString
    }
  },
  resolve: resolveCourseUnitSummary
};

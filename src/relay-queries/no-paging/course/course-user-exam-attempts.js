import { GraphQLString } from 'graphql';
import { resolveUserCourseExamAttempts } from '../../../relay-resolvers/course-unit-resolvers';
import { CourseType } from '../../../relay-models/course';

export default {
  type: CourseType,
  args: {
    course_id: {
      type: GraphQLString
    }
  },
  resolve: resolveUserCourseExamAttempts
};

import { GraphQLString } from 'graphql';
import { resolveCourseEntry } from '../../../relay-resolvers/course-resolvers';
import { CourseType } from '../../../relay-models/course';

export default {
  type: CourseType,
  args: {
    course_id: {
      type: GraphQLString
    }
  },
  resolve: resolveCourseEntry
};

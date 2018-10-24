import { GraphQLString } from 'graphql';
import { resolveCourseById } from '../../../relay-resolvers/course-resolver';
import { CourseType } from '../../../relay-models/course-type';

export default {
  type: CourseType,
  args: {
    course_id: {
      type: GraphQLString
    }
  },
  resolve: (obj, args, viewer, info) =>
    resolveCourseById(obj, args, viewer, info)
};

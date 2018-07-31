import { GraphQLString } from 'graphql';
import { CourseUnitType } from '../../../relay-models/course-unit';
import { resolveUnitEntry } from '../../../relay-resolvers/course-resolvers';

export default {
  type: CourseUnitType,
  description: 'Unit Entry',
  args: {
    course_id: {
      type: GraphQLString
    },
    unit_id: {
      type: GraphQLString
    }
  },
  resolve: (obj, args, viewer, info) =>
    resolveUnitEntry(obj, args, viewer, info)
};

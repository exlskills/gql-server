import { GraphQLString, GraphQLObjectType } from 'graphql';

export const CourseItemRefType = new GraphQLObjectType({
  name: 'CourseItemRef',
  description: 'Course Item Ref',
  fields: () => ({
    course_id: {
      type: GraphQLString
    },
    unit_id: {
      type: GraphQLString
    },
    section_id: {
      type: GraphQLString
    },
    card_id: {
      type: GraphQLString
    }
  })
});

import {
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList
} from 'graphql';
import { connectionDefinitions, globalIdField } from 'graphql-relay';
import { NodeInterface } from './node-definitions-type';

export const TextDocMatchedCourseItemType = new GraphQLObjectType({
  name: 'TextDocMatchedCourseItem',
  description: 'EXLskills Text Doc for Matched Course Item',
  fields: () => ({
    id: globalIdField('TextDocCourseItem', obj => obj._id),
    score: {
      type: GraphQLFloat
    },
    itemType: {
      type: CourseItemType
    },
    title: {
      type: GraphQLString
    },
    headline: {
      type: GraphQLString
    },
    highlights: {
      type: CourseItemHighlight
    },
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
  }),
  interfaces: [NodeInterface]
});

export const {
  connectionType: TextDocCourseItemConnection
} = connectionDefinitions({
  name: 'TextDocCourseItem',
  nodeType: TextDocMatchedCourseItemType
});

export const CourseItemType = new GraphQLEnumType({
  name: 'CourseItem',
  values: {
    course: { value: 'course' },
    unit: { value: 'unit' },
    section: { value: 'section' },
    card: { value: 'card' }
  }
});

export const CourseItemHighlight = new GraphQLObjectType({
  name: 'CourseItemHighlight',
  fields: {
    inTitle: {
      type: new GraphQLList(GraphQLString)
    },
    inHeadline: {
      type: new GraphQLList(GraphQLString)
    },
    inText: {
      type: new GraphQLList(GraphQLString)
    },
    inCode: {
      type: new GraphQLList(GraphQLString)
    }
  }
});

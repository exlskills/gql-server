import {
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import { connectionDefinitions, globalIdField } from 'graphql-relay';

import { VersionedContentRecordType } from './versioned-content-record-type';
import { QuestionType } from './question-type';
import { EmbeddedDocRefType } from './embedded-doc-ref-type';
import { NodeInterface } from './node-definitions-type';
// import { resolveSectionCardEma } from '../relay-resolvers/ema-resolvers';

export const SectionCardType = new GraphQLObjectType({
  name: 'SectionCard',
  description: 'Card of an EXLskills section',
  fields: () => ({
    id: globalIdField('SectionCard', obj => obj._id),
    index: {
      type: GraphQLInt
    },
    title: {
      type: GraphQLString
    },
    headline: {
      type: GraphQLString
    },
    content_id: {
      type: GraphQLID
    },
    tags: {
      type: new GraphQLList(GraphQLString) // TODO: needs more testing
    },
    question_ids: {
      type: new GraphQLList(GraphQLID) // TODO: needs more testing
    },
    ema: {
      type: GraphQLFloat
    },
    card_ref: {
      type: EmbeddedDocRefType
    },
    content: {
      type: VersionedContentRecordType
    },
    question: {
      type: QuestionType
    },
    questions: {
      type: new GraphQLList(QuestionType)
    },
    currentCourseId: globalIdField('Course', obj => obj.currentCourseId),
    currentUnitId: globalIdField('CourseUnit', obj => obj.currentUnitId),
    currentSectionId: globalIdField('UnitSection', obj => obj.currentSectionId)
  }),
  interfaces: [NodeInterface]
});

export const { connectionType: SectionCardConnection } = connectionDefinitions({
  name: 'SectionCard',
  nodeType: SectionCardType
});

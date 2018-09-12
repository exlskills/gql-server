import {
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import { connectionDefinitions, globalIdField } from 'graphql-relay';

import { VersionedContentRecordType } from './versioned-content-record';
import { QuestionType } from './question';
import { EmbeddedDocRefType } from './embedded-doc-ref';
import { NodeInterface } from './node-definitions';
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

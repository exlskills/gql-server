import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import { connectionDefinitions, globalIdField } from 'graphql-relay';

import { NodeInterface } from './node-definitions';
import { QuestionMultipleDataType } from './question-multiple-data';

export const QuestionDataType = new GraphQLObjectType({
  name: 'QuestionData',
  description: 'Question data for several question types',
  fields: () => ({
    id: globalIdField('QuestionData', obj => obj._id),
    // free_response
    tmpl_files: {
      type: GraphQLString
    },
    environment_key: {
      type: GraphQLString
    },
    use_advanced_features: {
      type: GraphQLBoolean
    },
    explanation: {
      type: GraphQLString
    },
    src_files: {
      type: GraphQLString
    },
    // multiple
    options: {
      type: new GraphQLList(QuestionMultipleDataType)
    }
  }),
  interfaces: [NodeInterface]
});

export const QuestionType = new GraphQLObjectType({
  name: 'Question',
  description: '',
  fields: () => ({
    id: globalIdField('Question', obj => obj._id),
    tags: {
      type: new GraphQLNonNull(new GraphQLList(GraphQLString))
    },
    points: {
      type: GraphQLInt
    },
    est_time_sec: {
      type: GraphQLInt
    },
    compl_level: {
      type: GraphQLInt
    },
    question_type: {
      type: new GraphQLNonNull(GraphQLString)
    },
    question_text: {
      type: new GraphQLNonNull(GraphQLString)
    },
    data: {
      type: new GraphQLNonNull(QuestionDataType)
    },
    question_answer: {
      type: GraphQLString
    },
    hint: {
      type: new GraphQLNonNull(GraphQLString)
    },
    hint_exists: {
      type: GraphQLBoolean
    },
    card_id: globalIdField('SectionCard', obj => obj.card_id)
  }),
  interfaces: [NodeInterface]
});

export const { connectionType: QuestionConnection } = connectionDefinitions({
  name: 'Question',
  nodeType: QuestionType
});

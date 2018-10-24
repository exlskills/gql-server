import { GraphQLObjectType, GraphQLString } from 'graphql';

import { globalIdField } from 'graphql-relay';

import { NodeInterface } from './node-definitions-type';

export const LangType = new GraphQLObjectType({
  name: 'Lang',
  description: 'Application Lang',
  fields: () => ({
    id: globalIdField('lang', obj => obj._id),
    label: {
      type: GraphQLString
    },
    value: {
      type: GraphQLString
    }
  }),
  interfaces: [NodeInterface]
});

//export const { connectionType: LangConnection } = connectionDefinitions({ name: 'Lang', nodeType: UserType });

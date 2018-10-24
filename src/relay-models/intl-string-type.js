import { GraphQLList, GraphQLObjectType } from 'graphql';

import { connectionDefinitions } from 'graphql-relay';

import { NodeInterface } from './node-definitions-type';
import { IntlStringRecordType } from './intl-string-record-type';

export const IntlStringType = new GraphQLObjectType({
  name: 'IntlString',
  description:
    'Represents a localized string mapping where each key is a Locale and each value is the localized version of that string based on the key.',
  fields: () => ({
    intlString: {
      type: new GraphQLList(IntlStringRecordType)
    }
  })
  // ,  interfaces: [NodeInterface]
});

/*
export const { connectionType: IntlStringConnection } = connectionDefinitions({
  name: 'IntlString',
  nodeType: IntlStringType
});
*/

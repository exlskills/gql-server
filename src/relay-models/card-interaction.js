import { GraphQLNonNull, GraphQLObjectType } from 'graphql';

import { connectionDefinitions, globalIdField } from 'graphql-relay';

import { NodeInterface } from './node-definitions';
import { CardActionType } from './card-action';

export const CardInteractionType = new GraphQLObjectType({
  name: 'CardInteraction',
  description: '',
  fields: () => ({
    id: globalIdField('CardInteraction', obj => obj._id),
    card_ref: {
      type: new GraphQLNonNull(EmbededDocRefType)
    },
    action: {
      type: new GraphQLNonNull(CardActionType)
    }
  }),
  interfaces: [NodeInterface]
});

export const {
  connectionType: CardInteractionConnection
} = connectionDefinitions({
  name: 'CardInteraction',
  nodeType: CardInteractionType
});

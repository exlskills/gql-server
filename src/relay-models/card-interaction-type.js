import { GraphQLNonNull, GraphQLObjectType } from 'graphql';

import { connectionDefinitions, globalIdField } from 'graphql-relay';

import { NodeInterface } from './node-definitions-type';
import { CardActionType } from './card-action-type';
import { CourseItemRefType } from './course-item-ref-type';

export const CardInteractionType = new GraphQLObjectType({
  name: 'CardInteraction',
  description: '',
  fields: () => ({
    id: globalIdField('CardInteraction', obj => obj._id),
    course_item_ref: {
      type: new GraphQLNonNull(CourseItemRefType)
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

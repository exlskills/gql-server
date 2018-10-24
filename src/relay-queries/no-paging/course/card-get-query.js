import { GraphQLID, GraphQLNonNull, GraphQLString } from 'graphql';

import { SectionCardType } from '../../../relay-models';
import {
  resolveGetCard,
  resolveGetCardByQuestion
} from '../../../relay-resolvers/section-card-resolver';

export const getCard = {
  type: SectionCardType,
  description: 'SectionCard Entry',
  args: {
    course_id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    unit_id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    section_id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    card_id: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: (obj, args, viewer, info) => resolveGetCard(obj, args, viewer, info)
};

export const getCardByQuestion = {
  type: SectionCardType,
  description: 'Card Entry by question ID',
  args: {
    question_id: {
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  resolve: (obj, args, viewer, info) =>
    resolveGetCardByQuestion(obj, args, viewer, info)
};

import { GraphQLNonNull, GraphQLString } from 'graphql';

import { SectionCardType } from '../../../relay-models';
import { resolveCardByQuestion } from '../../../relay-resolvers/course-resolvers';

export default {
  type: SectionCardType,
  description: 'Card Entry by question ID',
  args: {
    question_id: {
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  resolve: resolveCardByQuestion
};

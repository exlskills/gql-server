import { GraphQLID, GraphQLNonNull } from 'graphql';

import { SectionCardType } from '../../../relay-models';
import { resolveCardEntry } from '../../../relay-resolvers/section-card-resolvers';

export default {
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
  resolve: (obj, args, viewer, info) =>
    resolveCardEntry(obj, args, viewer, info)
};

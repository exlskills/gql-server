import { GraphQLString } from 'graphql';
import { resolveUserProfile } from '../../../relay-resolvers/user-resolvers';
import { UserType } from '../../../relay-models/user';

export default {
  type: UserType,
  args: {
    user_id: {
      type: GraphQLString
    }
  },
  resolve: resolveUserProfile
};

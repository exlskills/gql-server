import { GraphQLString } from 'graphql';
import { resolveUserProfile } from '../../../relay-resolvers/user-resolver';
import { UserType } from '../../../relay-models/user-type';

export default {
  type: UserType,
  args: {
    user_id: {
      type: GraphQLString
    }
  },
  resolve: resolveUserProfile
};

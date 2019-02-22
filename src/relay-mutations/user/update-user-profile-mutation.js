import {
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString
} from 'graphql';

import { fromGlobalId, mutationWithClientMutationId } from 'graphql-relay';

import { CompletionObjType } from '../../relay-models/completion-obj-type';
import {
  addUser,
  updateUserProfile
} from '../../relay-mutate-and-get/user-mag';

const UserProfileInputType = new GraphQLInputObjectType({
  name: 'UserProfileInput',
  description: 'User profile field for update',
  fields: () => ({
    id: { type: GraphQLID },
    full_name: { type: GraphQLString },
    username: { type: GraphQLString },
    primary_email: { type: GraphQLString },
    biography: { type: GraphQLString },
    headline: { type: GraphQLString },
    locales: { type: new GraphQLList(GraphQLString) },
    primary_locale: { type: new GraphQLNonNull(GraphQLString) },
    avatar_url: { type: GraphQLString }
  })
});

export default mutationWithClientMutationId({
  name: 'UpdateUserProfile',
  inputFields: {
    locale: {
      type: GraphQLString
    },
    profile: {
      type: UserProfileInputType
    }
  },
  outputFields: {
    completionObj: { type: CompletionObjType }
  },
  mutateAndGetPayload: ({ locale, profile }, viewer, info) => {
    if (profile && profile.id) {
      profile.id = fromGlobalId(profile.id).id;
    }
    return updateUserProfile(locale, profile, viewer).then(
      returnObj => returnObj
    );
  }
});

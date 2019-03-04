import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString
} from 'graphql';

import { fromGlobalId, mutationWithClientMutationId } from 'graphql-relay';

import { CompletionObjType } from '../../relay-models/completion-obj-type';
import { updateUserProfile } from '../../relay-mutate-and-get/user-mag';

const UserProfileInputType = new GraphQLInputObjectType({
  name: 'UserProfileInput',
  description: 'User profile field for update',
  fields: () => ({
    id: { type: GraphQLID },
    full_name: { type: GraphQLString },
    // Must be unique. Forced into lower case
    username: { type: GraphQLString },
    // Email change is disabled in the current design
    primary_email: { type: GraphQLString },
    biography: { type: GraphQLString },
    headline: { type: GraphQLString },
    locales: { type: new GraphQLList(GraphQLString) },
    primary_locale: { type: GraphQLString },
    avatar_url: { type: GraphQLString },
    is_public: { type: GraphQLBoolean },
    linkedin_username: { type: GraphQLString },
    twitter_username: { type: GraphQLString }
  })
});

export default mutationWithClientMutationId({
  name: 'UpdateUserProfile',
  inputFields: {
    // locale is used for intlString updates passed in the profile
    // if not passed - the primary user locale is used
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

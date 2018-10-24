import { GraphQLNonNull, GraphQLString } from 'graphql';

import { fromGlobalId, mutationWithClientMutationId } from 'graphql-relay';

import { CompletionObjType } from '../../relay-models/completion-obj-type';

import { readNotification } from '../../relay-mutate-and-get/notification-mag';

export default mutationWithClientMutationId({
  name: 'ReadNotification',
  inputFields: {
    notif_id: { type: new GraphQLNonNull(GraphQLString) }
  },
  outputFields: {
    completionObj: {
      type: CompletionObjType
    }
  },
  mutateAndGetPayload: ({ notif_id }, viewer, info) => {
    const localId = notif_id == 'all' ? 'all' : fromGlobalId(notif_id).id;
    return readNotification(localId, viewer).then(returnObj => returnObj);
  }
});

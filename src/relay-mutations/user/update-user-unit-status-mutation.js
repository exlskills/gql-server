import { GraphQLString } from 'graphql';

import { mutationWithClientMutationId } from 'graphql-relay';

import { CompletionObjType } from '../../relay-models/completion-obj-type';
import { updateUserUnitStatus } from '../../relay-mutate-and-get/user-mag';

export default mutationWithClientMutationId({
  name: 'UpdateUserUnitStatus',
  inputFields: {
    unit_id: {
      type: GraphQLString
    },
    course_id: {
      type: GraphQLString
    }
  },
  outputFields: {
    completionObj: { type: CompletionObjType }
  },
  mutateAndGetPayload: ({ unit_id, course_id }, viewer, info) =>
    updateUserUnitStatus(unit_id, course_id, viewer).then(
      returnObj => returnObj
    )
});

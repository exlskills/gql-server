import { GraphQLID, GraphQLNonNull } from 'graphql';

import { mutationWithClientMutationId, fromGlobalId } from 'graphql-relay';

import { FieldCudType } from '../../relay-queries/input-types-get-query';
import { CompletionObjType } from '../../relay-models/completion-obj-type';

import { updateUserCourseRole as updateUserCourseRoleDB } from '../../relay-mutate-and-get/user-course-role-mag';

export const updateUserCourseRole = mutationWithClientMutationId({
  name: 'UpdateUserCourseRole',
  inputFields: {
    user_id: { type: new GraphQLNonNull(GraphQLID) },
    course_id: { type: new GraphQLNonNull(GraphQLID) },
    cudContent: { type: new GraphQLNonNull(FieldCudType) }
  },
  outputFields: {
    completionObj: {
      type: CompletionObjType,
      resolve: ({ returnObj }) => returnObj.completionObj
    }
  },
  mutateAndGetPayload: ({ user_id, course_id, cudContent }, viewer, info) => {
    const localUserId = fromGlobalId(user_id).id;
    const localCourseId = fromGlobalId(course_id).id;
    return updateUserCourseRoleDB(
      localUserId,
      localCourseId,
      cudContent,
      viewer,
      info
    ).then(returnObj => ({ returnObj }));
  }
});

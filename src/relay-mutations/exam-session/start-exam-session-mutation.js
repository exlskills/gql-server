import {
  GraphQLFloat,
  GraphQLID,
  GraphQLNonNull,
  GraphQLString
} from 'graphql';

import {
  fromGlobalId,
  mutationWithClientMutationId,
  toGlobalId
} from 'graphql-relay';

import { CompletionObjType } from '../../relay-models/completion-obj-type';

import { startExam } from '../../relay-mutate-and-get/exam-session-mag';

export default mutationWithClientMutationId({
  name: 'StartExam',
  inputFields: {
    courseId: { type: new GraphQLNonNull(GraphQLID) },
    unitId: { type: new GraphQLNonNull(GraphQLID) }
  },
  outputFields: {
    exam_session_id: {
      type: GraphQLString,
      resolve: ({ returnObj }, viewer, info) =>
        toGlobalId('ExamSession', returnObj.exam_session_id)
    },
    exam_time_limit: {
      type: GraphQLFloat,
      resolve: ({ returnObj }, viewer, info) => returnObj.exam_time_limit
    },
    exam_id: {
      type: GraphQLString,
      resolve: ({ returnObj }, viewer, info) =>
        toGlobalId('Exam', returnObj.exam_id)
    },
    completionObj: {
      type: CompletionObjType,
      resolve: ({ returnObj }, viewer, info) => returnObj.completionObj
    }
  },
  mutateAndGetPayload: ({ courseId, unitId }, viewer, info) => {
    const localUnitId = fromGlobalId(unitId).id;
    const localCourseId = fromGlobalId(courseId).id;
    // NOTE: using { returnObj } to enable individual resolvers above
    return startExam(localCourseId, localUnitId, viewer).then(returnObj => ({
      returnObj
    }));
  }
});

import { GraphQLID, GraphQLNonNull, GraphQLString } from 'graphql';
import { fromGlobalId, mutationWithClientMutationId } from 'graphql-relay';
import { CompletionObjType } from '../../relay-models/completion-obj';
import { getCurrentExamQuestionAnswer } from '../../relay-mutate-and-get/exam-question-mag';
import { logger } from '../../utils/logger';
import { GraphQLDateTime } from 'graphql-iso-date';

export default mutationWithClientMutationId({
  name: 'GetCurrentExamQuestionAnswer',
  inputFields: {
    exam_session_id: { type: new GraphQLNonNull(GraphQLID) },
    question_id: { type: new GraphQLNonNull(GraphQLID) }
  },
  outputFields: {
    submitted_at: { type: GraphQLDateTime },
    response_data: { type: GraphQLString },
    completionObj: {
      type: CompletionObjType
    }
  },
  mutateAndGetPayload: ({ exam_session_id, question_id }, viewer, info) => {
    logger.debug(
      `in relay-mutation GetCurrentExamQuestionAnswer mutateAndGetPayload`
    );
    const localQuestionId = fromGlobalId(question_id).id;
    const localExamSessionId = fromGlobalId(exam_session_id).id;
    return getCurrentExamQuestionAnswer(
      localQuestionId,
      localExamSessionId,
      viewer
    ).then(returnObj => returnObj);
  }
});

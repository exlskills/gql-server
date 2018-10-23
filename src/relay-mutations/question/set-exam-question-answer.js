import { GraphQLID, GraphQLNonNull, GraphQLString } from 'graphql';
import { fromGlobalId, mutationWithClientMutationId } from 'graphql-relay';
import { CompletionObjType } from '../../relay-models/completion-obj';
import { processExamQuestionAnswer } from '../../relay-mutate-and-get/exam-question-mag';
import { logger } from '../../utils/logger';

export default mutationWithClientMutationId({
  name: 'SetExamQuestionAnswer',
  inputFields: {
    exam_session_id: { type: new GraphQLNonNull(GraphQLID) },
    question_id: { type: new GraphQLNonNull(GraphQLID) },
    response_data: { type: GraphQLString }
  },
  outputFields: {
    completionObj: {
      type: CompletionObjType
    }
  },
  mutateAndGetPayload: (
    { exam_session_id, question_id, response_data },
    viewer,
    info
  ) => {
    logger.debug(
      `in relay-mutation SubmitExamQuestionAnswer mutateAndGetPayload`
    );
    logger.debug(`response_data raw ` + response_data);
    const localQuestionId = fromGlobalId(question_id).id;
    const localExamSessionId = fromGlobalId(exam_session_id).id;
    return processExamQuestionAnswer(
      localQuestionId,
      localExamSessionId,
      response_data,
      viewer
    ).then(returnObj => returnObj);
  }
});

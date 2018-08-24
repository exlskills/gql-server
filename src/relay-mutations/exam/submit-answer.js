import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import { fromGlobalId, mutationWithClientMutationId } from 'graphql-relay';

import { CompletionObjType } from '../../relay-models/completion-obj';

import { processQuestionAction } from '../../relay-mutate-and-get/exam-question-mag';
import { CourseUnitType } from '../../relay-models/course-unit';
import { fetchCourseUnitsWithDetailedStatus } from '../../db-handlers/course/course-unit-fetch';
import { logger } from '../../utils/logger';

export default mutationWithClientMutationId({
  name: 'SubmitAnswer',
  inputFields: {
    exam_attempt_id: { type: new GraphQLNonNull(GraphQLID) },
    question_id: { type: new GraphQLNonNull(GraphQLID) },
    response_data: { type: GraphQLString },
    checkAnswer: { type: GraphQLBoolean },
    quiz: { type: GraphQLBoolean },
    is_quiz_start: { type: GraphQLBoolean },
    is_last_question: { type: GraphQLBoolean }
  },
  outputFields: {
    is_correct: {
      type: GraphQLBoolean
    },
    explain_text: {
      type: GraphQLString
    },
    grading_response: {
      type: GraphQLString
    },
    completionObj: {
      type: CompletionObjType
    },
    next_question: {
      type: new GraphQLObjectType({
        name: 'NextQuestion',
        description: 'NextQuestion',
        fields: () => ({
          course_id: {
            type: GraphQLString
          },
          section_id: {
            type: GraphQLString
          },
          unit_id: {
            type: GraphQLString
          }
        })
      })
    }
  },
  mutateAndGetPayload: (
    {
      exam_attempt_id,
      question_id,
      response_data,
      checkAnswer,
      quiz,
      is_quiz_start,
      is_last_question
    },
    viewer,
    info
  ) => {
    logger.debug(`in relay-mutation SubmitAnswer mutateAndGetPayload`);
    logger.debug(`response_data raw ` + response_data);
    const localQuestionId = fromGlobalId(question_id).id;
    const localExamAttemptId = fromGlobalId(exam_attempt_id).id;
    return processQuestionAction(
      localQuestionId,
      localExamAttemptId,
      response_data,
      checkAnswer,
      quiz,
      is_quiz_start,
      is_last_question,
      viewer
    ).then(returnObj => returnObj);
  }
});

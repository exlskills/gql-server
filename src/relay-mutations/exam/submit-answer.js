import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import { fromGlobalId, mutationWithClientMutationId } from 'graphql-relay';

import { CompletionObjType } from '../../relay-models/completion-obj';

import { answerQuestion } from '../../relay-mutate-and-get/exam-question-mag';
import { CourseUnitType } from '../../relay-models/course-unit';
import { fetchCourseUnits } from '../../db-handlers/course/course-unit-fetch';

import { singleToDoubleQuotes } from '../../utils/string-utils';

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
    unit: {
      type: CourseUnitType,
      resolve: async (obj, whatisthis, viewer) => {
        const docRefs = obj.question.doc_ref.EmbeddedDocRef.embedded_doc_refs;
        const course = docRefs.find(item => item.level == 'course');
        const unit = docRefs.find(item => item.level == 'unit');

        if (!course || !unit) {
          return Promise.reject('invalid docrefs');
        }
        const params = {
          userId: viewer.user_id,
          courseId: course.doc_id,
          unitId: unit.doc_id
        };
        const courses = await fetchCourseUnits({}, [], viewer.locale, params);
        return courses[0] ? courses[0] : {};
      }
    },
    is_correct: {
      type: GraphQLBoolean
    },
    explain_text: {
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
    const localQuestionId = fromGlobalId(question_id).id;
    const localExamAttemptId = fromGlobalId(exam_attempt_id).id;
    let resData;
    try {
      if (response_data) {
        resData = JSON.parse(singleToDoubleQuotes(response_data));
        if (resData.selected_ids) {
          resData.selected_ids = resData.selected_ids.map(
            optionId => fromGlobalId(optionId).id
          );
        }
      }
    } catch (error) {
      return Promise.reject(error.message);
    }
    return answerQuestion(
      localQuestionId,
      localExamAttemptId,
      resData,
      checkAnswer,
      quiz,
      is_quiz_start,
      is_last_question,
      viewer
    ).then(returnObj => returnObj);
  }
});

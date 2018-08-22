import {
  connectionFromDataSource,
  attachEmptyFrame
} from '../paging-processor/connection-from-datasource';
import { logger } from '../utils/logger';
import {
  fetchQuestionHint,
  getQuestions,
  getQuestionsInExamAttempt
} from '../db-handlers/question-fetch';
import { fromGlobalId } from 'graphql-relay';

export const resolveQuestionHint = async (obj, args, viewer, info) => {
  logger.debug(`in resolveQuestionHint`);
  const businessKey = '_id';
  const fetchParameters = {};
  if (args.resolverArgs) {
    const questionParam = args.resolverArgs.find(
      e => e.param === 'question_id'
    );
    if (questionParam) {
      logger.debug(`question param ` + questionParam.value);
      fetchParameters.questionId = fromGlobalId(questionParam.value).id;
      logger.debug(
        `question param - from global id ` +
          fromGlobalId(questionParam.value).id
      );
    } else {
      return Promise.reject('invalid args - missing question id');
    }
  } else {
    return Promise.reject('invalid args - missing question id');
  }

  let result = await fetchQuestionHint(fetchParameters, viewer);
  return result[0];
};

export const resolveGetQuestion = (obj, args, viewer, info) => {
  logger.debug(`in resolveGetQuestion`);
  if (!args || !args.resolverArgs) {
    return attachEmptyFrame();
  }

  let fetchParameters = {
    userId: viewer.user_id
  };
  const unitParam = args.resolverArgs.find(e => e.param === 'unit_id');
  if (unitParam) {
    fetchParameters.unitId = fromGlobalId(unitParam.value).id;
  }
  const sectionParam = args.resolverArgs.find(e => e.param === 'section_id');
  if (sectionParam) {
    fetchParameters.sectionId = fromGlobalId(sectionParam.value).id;
  }
  const execDetails = {
    queryFunction: getQuestions,
    businessKey: '_id',
    fetchParameters: fetchParameters
  };

  return connectionFromDataSource(execDetails, obj, args, viewer, info);
};

export const resolveGetQuestionsForExam = (obj, args, viewer, info) => {
  logger.debug(`in resolveGetQuestionsForExam`);
  if (!args || !args.resolverArgs) {
    return attachEmptyFrame();
  }
  //const courseParam = args.resolverArgs.find(e => e.param === 'unit_id');
  const unitParam = args.resolverArgs.find(e => e.param === 'unit_id');
  const courseParam = args.resolverArgs.find(e => e.param === 'course_id');
  let fetchParameters = {
    userId: viewer.user_id,
    courseId: fromGlobalId(courseParam.value).id,
    unitId: fromGlobalId(unitParam.value).id
  };
  if (args.resolverArgs.find(e => e.param === 'exam_attempt_id')) {
    const attempt = args.resolverArgs.find(e => e.param === 'exam_attempt_id');
    fetchParameters.exam_attempt_id = fromGlobalId(attempt.value).id;
  }
  const execDetails = {
    queryFunction: getQuestionsInExamAttempt,
    businessKey: '_id',
    fetchParameters: fetchParameters
  };
  return connectionFromDataSource(execDetails, obj, args, viewer, info);
};

import { basicFind } from '../basic-query-handler';
import Question from '../../db-models/question-model.js';
import { QUESTION_TYPES } from '../../db-models/question-model.js';
import * as projectionWriter from '../../utils/projection-writer';
import { getStringByLocale } from '../../utils/intl-string-utils';
import { returnObjectExamAttempt } from '../exam-fetch';
import { getUserAnswer } from './question-interaction-fetch';
import { toGlobalId } from 'graphql-relay';
import { logger } from '../../utils/logger';
import { recordIncident } from '../incidents-cud';

export const fetchById = async (obj_id, selectVal, viewer, info) => {
  logger.debug(`in Question fetchById`);
  let record;
  try {
    //model, runParams, queryVal, sortVal, selectVal
    record = await basicFind(
      Question,
      { isById: true },
      obj_id,
      null,
      selectVal
    );
  } catch (errInternalAlreadyReported) {
    return null;
  }
  return record;
};

export const fetchQuestionHint = async (fetchParameters, viewer) => {
  logger.debug(`in fetchQuestionHint`);
  let array = [];
  let elem;
  let viewerLocale = viewer.locale;
  elem = { $match: { _id: fetchParameters.questionId } };
  array.push(elem);
  elem = {
    $project: {
      exam_only: 1,
      'hint.intlString': projectionWriter.writeIntlStringFilter(
        'hint',
        viewerLocale
      )
    }
  };
  array.push(elem);
  elem = {
    $project: {
      exam_only: 1,
      hint: projectionWriter.writeIntlStringEval('hint', viewerLocale)
    }
  };
  array.push(elem);
  let questionRecord = await Question.aggregate(array).exec();
  logger.debug(`in fetchQuestionHint result ` + JSON.stringify(questionRecord));

  if (questionRecord && questionRecord.length > 0) {
    const result = { _id: questionRecord[0]._id };
    if (questionRecord[0].exam_only) {
      //  Do not wait for this
      recordIncident(viewer.user_id, 'exam_question', 'hint requested');
      result.hint = 'Not available for Exam questions';
    } else {
      result.hint = questionRecord[0].hint;
    }
    return result;
  } else {
    return [];
  }
};

export const getQuestions = async (
  filterValues,
  aggregateArray,
  viewerLocale,
  fetchParameters
) => {
  // This should only return the "question" part, no hints or answers
  logger.debug(`in getQuestions`);
  let filterArray = [];
  let elem;
  let sort = { $sort: { _id: 1 } };
  let skip = aggregateArray.find(item => !!item.$skip);
  let limit = aggregateArray.find(item => !!item.$limit);
  if (fetchParameters.unitId) {
    elem = {
      $match: {
        'course_item_ref.unit_id': fetchParameters.unitId
      }
    };
    filterArray.push(elem);
  } else {
    elem = {
      $match: {
        'course_item_ref.section_id': fetchParameters.sectionId
      }
    };
    filterArray.push(elem);
  }

  let result = await fetchQuestionsGeneric(
    filterArray,
    sort,
    skip,
    limit,
    viewerLocale
  );

  for (let question of result) {
    if (question.course_item_ref && question.course_item_ref.card_id) {
      question.card_id = question.course_item_ref.card_id;
    }
  }

  logger.debug(`   getQuestions result ` + JSON.stringify(result));

  return result;
};

export const getQuestionsInExamAttempt = async (
  filterValues,
  aggregateArray,
  viewerLocale,
  fetchParameters
) => {
  logger.debug(`in getQuestionsInExamAttempt`);
  let filterArray = [];
  let elem;
  let sort = { $sort: { sort_sequence: 1 } };
  let skip = aggregateArray.find(item => !!item.$skip);
  let limit = aggregateArray.find(item => !!item.$limit);
  let viewer = {
    user_id: fetchParameters.userId,
    locale: viewerLocale
  };
  let arrayReturn = await returnObjectExamAttempt(
    fetchParameters.unitId,
    fetchParameters.courseId,
    viewer
  );
  const quesIds = arrayReturn.arrayQuestion;
  elem = { $match: { _id: { $in: quesIds } } };
  filterArray.push(elem);
  elem = {
    $addFields: { sort_sequence: { $indexOfArray: [quesIds, '$_id'] } }
  };
  filterArray.push(elem);

  const result = await fetchQuestionsGeneric(
    filterArray,
    sort,
    skip,
    limit,
    viewerLocale
  );

  // Load latest user answer
  for (let question of result) {
    let userAnswer;
    if (fetchParameters.exam_session_id) {
      userAnswer = await getUserAnswer(
        fetchParameters.exam_session_id,
        question._id,
        fetchParameters.userId
      );
    }

    if (userAnswer && userAnswer.length > 0) {
      const lastResp = userAnswer.pop();
      userAnswer = {
        selected_ids: lastResp.selected_ids.map(selId =>
          toGlobalId('QuestionMultipleData', selId)
        )
      };
      question.question_answer = JSON.stringify(userAnswer);
    }
  }

  logger.debug(`getQuestionsForExam result ` + JSON.stringify(result));
  return result;
};

export const fetchQuestionsGeneric = async (
  filterArray,
  sort,
  skip,
  limit,
  viewerLocale
) => {
  logger.debug(`in fetchQuestionsGeneric`);

  //logger.debug(`   sort ` + JSON.stringify(sort));
  //logger.debug(`   skip ` + JSON.stringify(skip));
  //logger.debug(`   limit ` + JSON.stringify(limit));

  let array = filterArray;
  let elem = {
    $project: {
      sort_sequence: 1,
      course_item_ref: 1,
      question_type: 1,
      'question_text.intlString': projectionWriter.writeIntlStringFilter(
        'question_text',
        viewerLocale
      ),
      data: {
        _id: 1,
        seq: 1,
        text: 1,
        api_version: 1,
        environment_key: 1
      },
      'data.tmpl_files.intlString': projectionWriter.writeIntlStringFilter(
        'data.tmpl_files',
        viewerLocale
      ),
      'hint.intlString': projectionWriter.writeIntlStringFilter(
        'hint',
        viewerLocale
      )
    }
  };
  array.push(elem);
  elem = {
    $project: {
      sort_sequence: 1,
      course_item_ref: 1,
      question_type: 1,
      question_text: projectionWriter.writeIntlStringEval(
        'question_text',
        viewerLocale
      ),
      tmpl_files: projectionWriter.writeIntlStringEval(
        'data.tmpl_files',
        viewerLocale
      ),
      data: {
        _id: 1,
        seq: 1,
        text: 1,
        api_version: 1,
        environment_key: 1
      },
      hint_exists: {
        $cond: {
          if: {
            $ne: [
              projectionWriter.writeIntlStringEval('hint', viewerLocale),
              ''
            ]
          },
          then: true,
          else: false
        }
      }
    }
  };
  array.push(elem);
  if (sort) array.push(sort);
  if (skip) array.push(skip);
  if (limit) array.push(limit);

  const result = await Question.aggregate(array).exec();

  for (let question of result) {
    if (
      question.question_type === QUESTION_TYPES.MULT_CHOICE_SINGLE_ANSWER ||
      question.question_type === QUESTION_TYPES.MULT_CHOICE_MULT_ANSWERS
    ) {
      question.data = {
        _id: question._id,
        options: question.data.map(item => ({
          _id: item._id,
          seq: item.seq,
          text: getStringByLocale(item.text, viewerLocale).text
        }))
      };
    } else if (
      question.question_type === QUESTION_TYPES.WRITE_SOFTWARE_CODE_QUESTION
    ) {
      question.data.tmpl_files = question.tmpl_files;
    }
    delete question.tmpl_files;
    //question.hint = 'get hint';
  }

  logger.debug(`  fetchQuestionsGeneric result ` + JSON.stringify(result));
  return result;
};

import { basicFind } from '../db-handlers/basic-query-handler';
import Question from '../db-models/question-model.js';
import * as projectionWriter from '../utils/projection-writer';
import { getStringByLocale } from '../parsers/intl-string-parser';
import { returnObjectExamAttempt } from '../db-handlers/exam-fetch';
import { getUserAnswer } from '../db-handlers/question-interaction-fetch';
import { toGlobalId } from 'graphql-relay';
import { logger } from '../utils/logger';
import Course from '../db-models/course-model';

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
      'hint.intlString': projectionWriter.writeIntlStringFilter(
        'hint',
        viewerLocale
      )
    }
  };
  array.push(elem);
  elem = {
    $project: {
      hint: projectionWriter.writeIntlStringEval('hint', viewerLocale)
    }
  };
  array.push(elem);
  let result = await Question.aggregate(array).exec();
  //  logger.debug(result);
  // return Question.aggregate(array).exec();
  return result;
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
  let sort = { $sort: { index: 1 } };
  let skip = aggregateArray.find(item => !!item.$skip);
  let limit = aggregateArray.find(item => !!item.$limit);
  if (fetchParameters.unitId) {
    elem = {
      $match: {
        'doc_ref.EmbeddedDocRef.embedded_doc_refs.level': 'unit',
        'doc_ref.EmbeddedDocRef.embedded_doc_refs.doc_id':
          fetchParameters.unitId
      }
    };
    filterArray.push(elem);
  } else {
    elem = {
      $match: {
        'doc_ref.EmbeddedDocRef.embedded_doc_refs.level': 'section',
        'doc_ref.EmbeddedDocRef.embedded_doc_refs.doc_id':
          fetchParameters.sectionId
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
    if (
      question.doc_ref &&
      question.doc_ref.EmbeddedDocRef &&
      question.doc_ref.EmbeddedDocRef.embedded_doc_refs
    ) {
      const cardRef = question.doc_ref.EmbeddedDocRef.embedded_doc_refs.find(
        item => item.level === 'card'
      );
      if (cardRef) {
        question.card_id = cardRef.doc_id;
      }
    }
  }

  logger.debug(`getQuestions result ` + JSON.stringify(result));

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
    if (fetchParameters.exam_session_id != null) {
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

  logger.debug(`   sort ` + JSON.stringify(sort));
  logger.debug(`   skip ` + JSON.stringify(skip));
  logger.debug(`   limit ` + JSON.stringify(limit));

  let array = filterArray;
  let elem = {
    $project: {
      sort_sequence: 1,
      doc_ref: 1,
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
      doc_ref: 1,
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
      question.question_type === 'MCSA' ||
      question.question_type === 'MCMA'
    ) {
      question.data = {
        _id: question._id,
        options: question.data.map(item => ({
          _id: item._id,
          seq: item.seq,
          text: getStringByLocale(item.text, viewerLocale).text
        }))
      };
    } else if (question.question_type === 'WSCQ') {
      question.data.tmpl_files = question.tmpl_files;
    }
    delete question.tmpl_files;
    //question.hint = 'get hint';
  }

  logger.debug(`question fetch generic result ` + JSON.stringify(result));
  return result;
};

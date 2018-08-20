import { basicFind } from '../db-handlers/basic-query-handler';
import Question from '../db-models/question-model.js';
import * as projectionWriter from '../utils/projection-writer';
import { getStringByLocale } from '../parsers/intl-string-parser';
import { returnObjectExamAttempt } from '../db-handlers/exam-fetch';
import { getUserAnswer } from '../db-handlers/question-interaction-fetch';
import { toGlobalId } from 'graphql-relay';
import { logger } from '../utils/logger';

export const findById = async (obj_id, viewer, info) => {
  logger.debug(`in Question findById`);
  let record;
  try {
    //model, runParams, queryVal, sortVal, selectVal
    record = await basicFind(Question, { isById: true }, obj_id);
  } catch (errInternalAllreadyReported) {
    return null;
  }
  return record;
};

export const fetchQuestionEntry = async (fetchParameters, viewer) => {
  logger.debug(`in fetchQuestionEntry`);
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
  logger.debug(`in getQuestions`);
  let array = [];
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
    array.push(elem);
  } else {
    elem = {
      $match: {
        'doc_ref.EmbeddedDocRef.embedded_doc_refs.level': 'section',
        'doc_ref.EmbeddedDocRef.embedded_doc_refs.doc_id':
          fetchParameters.sectionId
      }
    };
    array.push(elem);
  }
  elem = {
    $project: {
      doc_ref: 1,
      question_type: 1,
      question_text: 1,
      data: {
        _id: 1,
        text: 1,
        seq: 1,
        tmpl_files: 1
      },
      'hint.intlString': projectionWriter.writeIntlStringFilter(
        'hint',
        viewerLocale
      )
    }
  };
  array.push(elem);
  elem = {
    $project: {
      doc_ref: 1,
      question_type: 1,
      question_text: 1,
      data: {
        _id: 1,
        text: 1,
        seq: 1,
        tmpl_files: 1
      },
      hint: projectionWriter.writeIntlStringEval('hint', viewerLocale),
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
  let result = await Question.aggregate(array).exec();
  for (let question of result) {
    question.question_text = getStringByLocale(
      question.question_text,
      viewerLocale
    ).text;
    if (
      question.question_type === 'MCSA' ||
      question.question_type === 'MCMA'
    ) {
      question.data = {
        options: question.data.map(item => ({
          _id: item._id,
          seq: item.seq,
          text: getStringByLocale(item.text, viewerLocale).text
        }))
      };
    } else if (question.question_type === 'WSCQ') {
      question.data.tmpl_files = getStringByLocale(
        question.data.tmpl_files,
        viewerLocale
      ).text;
    }

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
  return result;
};
export const getQuestionsByExam = async (
  filterValues,
  aggregateArray,
  viewerLocale,
  fetchParameters
) => {
  logger.debug(`in getQuestionsByExam`);
  let array = [];
  let elem;
  let sort = { $sort: { sequence: 1 } };
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
  array.push(elem);
  array.push({
    $addFields: { sequence: { $indexOfArray: [quesIds, '$_id'] } }
  });
  elem = {
    $project: {
      sequence: 1,
      points: 1,
      question_type: 1,
      question_text: 1,
      data: {
        _id: 1,
        text: 1,
        seq: 1,
        tmpl_files: 1
      },
      'hint.intlString': projectionWriter.writeIntlStringFilter(
        'hint',
        viewerLocale
      )
    }
  };
  array.push(elem);
  elem = {
    $project: {
      sequence: 1,
      points: 1,
      question_type: 1,
      question_text: 1,
      data: {
        _id: 1,
        text: 1,
        seq: 1,
        tmpl_files: 1
      },
      hint: projectionWriter.writeIntlStringEval('hint', viewerLocale),
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
  let result = await Question.aggregate(array).exec();
  for (let question of result) {
    let response;
    if (fetchParameters.exam_attempt_id != null) {
      response = await getUserAnswer(
        fetchParameters.exam_attempt_id,
        question._id,
        fetchParameters.userId
      );
    }
    question.question_text = getStringByLocale(
      question.question_text,
      viewerLocale
    ).text;
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
      if (response && response.length > 0) {
        const lastResp = response.pop();
        response = {
          selected_ids: lastResp.selected_ids.map(selId =>
            toGlobalId('QuestionMultipleData', selId)
          )
        };
        question.question_answer = JSON.stringify(response);
      }
    } else if (question.question_type === 'WSCQ') {
      question.data.tmpl_files = getStringByLocale(
        question.data.tmpl_files,
        viewerLocale
      ).text;
    }
  }
  return result;
};

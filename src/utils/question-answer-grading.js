import { logger } from './logger';
import { singleToDoubleQuotes } from './string-utils';
import { fromGlobalId } from 'graphql-relay';
import { getStringByLocale } from '../parsers/intl-string-parser';
import { QUESTION_TYPES } from '../db-models/question-model';
import {
  callWsenvGrading,
  editGradingResponse,
  getWsenvGradingClient
} from './wsenv-connect';

export const gradeMCQuestionAnswer = async (
  question,
  response_data,
  viewer
) => {
  logger.debug(`in gradeMCQuestionAnswer`);
  logger.debug(`   question ` + JSON.stringify(question));
  logger.debug(`   response data ` + response_data);

  // This is run inside 'try' of the calling routine
  let response_data_adj;
  if (response_data) {
    try {
      const quoted = singleToDoubleQuotes(response_data);
      // logger.debug(`   response data quoted ` + quoted);
      response_data_adj = JSON.parse(quoted);
    } catch (err) {
      logger.error(`response_data parsing issue ` + err);
      throw new Error(err);
    }
    if (response_data_adj.selected_ids) {
      response_data_adj.selected_ids = response_data_adj.selected_ids.map(
        optionId => fromGlobalId(optionId).id
      );
    }
  }

  let is_correct = false;
  let explain_text = '';
  let points = 0;
  let pct_score = 0;

  // logger.debug(`   response_data_adj ` + JSON.stringify(response_data_adj));

  if (response_data_adj) {
    is_correct = true;
    let isAnswer_count = 0;
    const options = question.data.sort((a, b) => a.seq - b.seq);
    for (let item of options) {
      if (item.is_answer) {
        isAnswer_count++;
        if (response_data_adj.selected_ids.indexOf(item._id.toString()) < 0) {
          is_correct = false;
        }
      }
      const intlText = getStringByLocale(item.explanation, viewer.locale).text;
      explain_text = `${explain_text}${intlText}\n\n`;
    }

    if (isAnswer_count < response_data_adj.selected_ids.length) {
      is_correct = false;
    }
  }

  if (
    question.question_type === QUESTION_TYPES.MULT_CHOICE_SINGLE_ANSWER &&
    is_correct
  ) {
    points = question.points;
    pct_score = 100;
  } else if (
    question.question_type === QUESTION_TYPES.MULT_CHOICE_MULT_ANSWERS &&
    response_data_adj
  ) {
    let correctAnswersArray = [];
    let correctAnswersCount = 0;
    let incorrectAnswersCount = 0;
    let totalIsAnswerCount = 0;
    for (let item of question.data) {
      if (item.is_answer) {
        totalIsAnswerCount++;
        if (response_data_adj.selected_ids.indexOf(item._id.toString()) < 0) {
          incorrectAnswersCount++;
        } else {
          correctAnswersCount++;
          correctAnswersArray.push(item._id.toString());
        }
      }
    }
    for (let answerId of response_data_adj.selected_ids) {
      if (correctAnswersArray.indexOf(answerId) < 0) {
        incorrectAnswersCount++;
      }
    }

    const answerBalance = correctAnswersCount - incorrectAnswersCount;
    if (answerBalance > 0) {
      points = (question.points / totalIsAnswerCount) * answerBalance;
      pct_score = (points / question.points) * 100;
    }
  }

  // N/A for this Question type
  const grading_response = '';

  return { is_correct, explain_text, points, pct_score, grading_response };
};

export const gradeWSCQQuestionAnswer = async (
  question,
  response_data,
  viewer
) => {
  logger.debug(`in gradeWSCQQuestionAnswer`);

  logger.debug(`response_data raw ` + response_data);
  if (!response_data) {
    return { is_correct: false, explain_text: '', points: 0, pct_score: 0 };
  }
  const rd_object = JSON.parse(response_data);
  logger.debug(`r_d u-f ` + rd_object.user_files);
  //logger.debug(`response_data json-s ` + JSON.stringify(rd_object));

  if (!rd_object.user_files) {
    return { is_correct: false, explain_text: '', points: 0, pct_score: 0 };
  }

  // This is run inside 'try' of the calling routine

  const wsenvGradingUrl = await getWsenvGradingClient();
  logger.debug(`grading url ` + wsenvGradingUrl);

  let gradingCallObject = {
    apiVersion: question.data.api_version,
    gradingStrategy: question.data.grading_strategy,
    gradingTests: JSON.parse(question.data.grading_tests),
    environmentKey: question.data.environment_key,
    testFiles: JSON.parse(question.data.test_files),
    // userFiles: JSON.parse(test_user_files)
    userFiles: JSON.parse(rd_object.user_files)
  };

  const call_response = await callWsenvGrading(
    wsenvGradingUrl,
    gradingCallObject
  );
  let response = {
    is_correct: false,
    points: 0,
    pct_score: 0,
    explain_text: getStringByLocale(question.data.explanation, viewer.locale)
      .text
  };
  if (call_response.success && call_response.data) {
    if (
      call_response.data.failedCount === 0 &&
      call_response.data.passedCount >= 0
    ) {
      response.is_correct = true;
      response.points = question.points;
      response.pct_score = 100;
    } else if (call_response.data.passedCount > 0) {
      response.points =
        (question.points /
          (call_response.data.passedCount + call_response.data.failedCount)) *
        call_response.data.passedCount;
      response.pct_score = (response.points / question.points) * 100;
    }
    response.grading_response = editGradingResponse(
      call_response.data.gradingTests
    );
  } else {
    response.grading_response = call_response.message;
  }

  logger.debug(`response ` + JSON.stringify(response));
  return response;
};

import { upsertQuestionInteraction } from '../db-handlers/question-interaction-cud';
import * as QuestionFetch from '../db-handlers/question-fetch';
import { getStringByLocale } from '../parsers/intl-string-parser';
import * as ExamAttemptFetch from '../db-handlers/exam-session-fetch';
import { fetchById } from '../db-handlers/course/course-fetch';
import { fetchUnitSections } from '../db-handlers/course/unit-section-fetch';
import { toClientUrlId } from '../utils/client-url';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';
import { singleToDoubleQuotes } from '../utils/string-utils';
import { fromGlobalId } from 'graphql-relay';

import {
  getWsenvGradingClient,
  callWsenvGrading,
  editGradingResponse
} from '../utils/wsenv-connect';
import { fetchCourseUnitsBase } from '../db-handlers/course/course-unit-fetch';

const ObjectId = mongoose.Types.ObjectId;

export const processCardQuestionAction = async (
  question_id,
  exam_attempt_id,
  response_data,
  check_answer,
  quiz,
  is_quiz_start,
  is_last_question,
  viewer
) => {
  logger.debug(`in processCardQuestionAction`);
  logger.debug(`   check_answer ` + check_answer);
  logger.debug(`   quiz ` + quiz);
  logger.debug(`   is_quiz_start ` + is_quiz_start);
  logger.debug(`   is_last_question ` + is_last_question);

  try {
    const question = await QuestionFetch.fetchById(question_id, {
      question_text: 0
    });
    if (!question || question.exam_only) {
      return {
        completionObj: {
          code: '1',
          msg: 'Invalid question',
          msg_id: 'invalid_q'
        }
      };
    }

    logger.debug(`question ` + JSON.stringify(question));
    let returnData = {
      // question: question,
      is_correct: false,
      explain_text: '',
      grading_response: '',
      completionObj: {
        code: '0',
        msg: '',
        msg_id: ''
      }
    };

    let questionInteractionInfo = {
      user_id: viewer.user_id,
      question_id: question_id,
      exam_session_id: quiz ? exam_attempt_id : ObjectId(exam_attempt_id),
      is_complete: !quiz, // quiz false by default
      exam_type: quiz ? 'quiz' : 'unit_exam',
      points: 0,
      pct_score: 0
    };

    if (is_quiz_start) {
      questionInteractionInfo.result = '';
      questionInteractionInfo.$push = { entered_at: new Date() };
    } else {
      questionInteractionInfo.result = response_data
        ? 'question_submitted'
        : 'skipped';
    }

    if (response_data) {
      if (!questionInteractionInfo.$push) {
        questionInteractionInfo.$push = {};
      }
      questionInteractionInfo.$push.response_data = response_data;
    }

    const docRefs = question.doc_ref.EmbeddedDocRef.embedded_doc_refs;
    const courseId = docRefs.find(item => item.level === 'course');
    const unitId = docRefs.find(item => item.level === 'unit');
    const sectionId = docRefs.find(item => item.level === 'section');

    if (check_answer || !quiz) {
      // is_correct, explain_text, points, pct_score
      let gradingObj = {
        is_correct: false,
        explain_text: '',
        grading_response: ''
      };

      if (
        question.question_type === 'MCSA' ||
        question.question_type === 'MCMA'
      ) {
        gradingObj = await gradeMCQuestionAnswer(
          question,
          response_data,
          viewer
        );
        gradingObj.grading_response = '';
      } else if (question.question_type === 'WSCQ') {
        gradingObj = await gradeWSCQQuestionAnswer(
          question,
          response_data,
          viewer
        );
      } else {
        return {
          completionObj: {
            code: '1',
            msg:
              'Grading logic not implemented for question type ' +
              question.question_type
          }
        };
      }

      questionInteractionInfo.points = gradingObj.points;
      questionInteractionInfo.pct_score = gradingObj.pct_score;

      returnData.is_correct = gradingObj.is_correct;
      returnData.explain_text = gradingObj.explain_text;
      returnData.grading_response = gradingObj.grading_response;
    }

    const uqi_output = await upsertQuestionInteraction(questionInteractionInfo);

    if (!quiz) {
      let examattempt = await ExamAttemptFetch.fetchById(
        questionInteractionInfo.exam_session_id,
        { _id: 1, question_ids: 1, question_interaction_ids: 1 }
      );
      if (examattempt) {
        const quesInterIdx = examattempt.question_interaction_ids.findIndex(
          item => item.toString() === uqi_output.record._id.toString()
        );
        if (quesInterIdx === -1) {
          examattempt.question_interaction_ids.push(uqi_output.record._id);
        }
        examattempt.final_grade_pct = await ExamAttemptFetch.computeFinalGrade(
          examattempt.question_interaction_ids
        );
        if (isNaN(examattempt.final_grade_pct)) {
          examattempt.final_grade_pct = 0;
        }
        examattempt.final_grade_pct =
          examattempt.final_grade_pct / examattempt.question_ids.length;
        await examattempt.save();
      }
    }

    if (is_last_question) {
      const courseData = await fetchById(courseId.doc_id, { title: 1 });

      let fetchParameters = {
        courseId: courseId.doc_id,
        unitId: unitId.doc_id
      };

      let unitSectionData = await fetchUnitSections(
        null,
        [],
        viewer.locale,
        fetchParameters
      );

      let nextUnit = null;
      let nextSection = null;
      const currSectionArrayPos = unitSectionData.findIndex(
        item => item._id === sectionId.doc_id
      );
      if (currSectionArrayPos < unitSectionData.length - 1) {
        nextUnit = await fetchCourseUnitsBase(
          null,
          null,
          viewer.locale,
          fetchParameters,
          false
        );
        nextUnit = nextUnit[0];
        nextSection = unitSectionData[currSectionArrayPos + 1];
      } else {
        delete fetchParameters.unitId;
        fetchParameters.unitIndex = unitSectionData[0].currentUnitIndex + 1;
        nextUnit = await fetchCourseUnitsBase(
          null,
          null,
          viewer.locale,
          fetchParameters,
          false
        );
        if (nextUnit && nextUnit.length > 0) {
          nextUnit = nextUnit[0];
          delete fetchParameters.unitIndex;
          fetchParameters.unitId = nextUnit._id;
          unitSectionData = await fetchUnitSections(
            null,
            [],
            viewer.locale,
            fetchParameters
          );
          nextSection = unitSectionData[0];
        }
      }

      const courseTitle = getStringByLocale(courseData.title, viewer.locale);

      returnData.next_question = {
        course_id: toClientUrlId(courseTitle.text, courseData._id)
      };

      if (nextUnit && nextSection) {
        returnData.next_question.unit_id = toClientUrlId(
          nextUnit.title,
          nextUnit._id
        );
        returnData.next_question.section_id = toClientUrlId(
          nextSection.title,
          nextSection._id
        );
      }
    }

    logger.debug(
      `processQuestionAction returnData ` + JSON.stringify(returnData)
    );
    return returnData;
  } catch (error) {
    logger.error(`Error ` + error);
    return { completionObj: { code: '1', msg: error.message } };
  }
};

const gradeMCQuestionAnswer = async (question, response_data, viewer) => {
  logger.debug(`in gradeMCQuestionAnswer`);
  // This is run inside 'try' of the calling routine
  let response_data_adj;
  if (response_data) {
    response_data_adj = JSON.parse(singleToDoubleQuotes(response_data));
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

  // TODO use global static constants
  if (question.question_type === 'MCSA' && is_correct) {
    points = question.points;
    pct_score = 100;
  } else if (question.question_type === 'MCMA' && response_data_adj) {
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

  return { is_correct, explain_text, points, pct_score };
};

const gradeWSCQQuestionAnswer = async (question, response_data, viewer) => {
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

  //logger.debug(`p1_raw ` + question.data.grading_tests);
  //logger.debug(`p2_raw ` + question.data.test_files);
  logger.debug(`p3_raw ` + rd_object.user_files);
  //logger.debug(`p1 ` + JSON.parse(question.data.grading_tests));
  //logger.debug(`p2 ` + JSON.parse(question.data.test_files));
  logger.debug(`p3 ` + JSON.parse(rd_object.user_files));

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

export const processExamQuestionAnswer = async (
  question_id,
  exam_attempt_id,
  response_data,
  viewer
) => {
  logger.debug(`in processExamQuestionAnswer`);

  try {
    const question = await QuestionFetch.fetchById(question_id, {
      _id: 1,
      exam_only: 1
    });
    if (!question || !question.exam_only) {
      return {
        completionObj: {
          code: '1',
          msg: 'Invalid question',
          msg_id: 'invalid_q'
        }
      };
    }
    logger.debug(`question ` + JSON.stringify(question));

  } catch (error) {
    logger.error(`Error ` + error);
    return { completionObj: { code: '1', msg: error.message } };
  }
};

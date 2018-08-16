import { upsertQuestionInteraction } from '../db-handlers/question-interaction-cud';
import * as QuestionFetch from '../db-handlers/question-fetch';
import { getStringByLocale } from '../parsers/intl-string-parser';
import * as ExamAttemptFetch from '../db-handlers/exam-attempt-fetch';
import * as CourseFetch from '../db-handlers/course/course-fetch';
import { toClientUrlId } from '../utils/client-url';

import mongoose from 'mongoose';
import { singleToDoubleQuotes } from '../utils/string-utils';
import { fromGlobalId } from 'graphql-relay';

const ObjectId = mongoose.Types.ObjectId;

export const gradeQuestionAnswer = async (
  question_id,
  exam_attempt_id,
  response_data,
  check_answer,
  quiz,
  is_quiz_start,
  is_last_question,
  viewer
) => {
  console.log(`in gradeQuestionAnswer`);

  try {
    let questionInteractionInfo = {
      user_id: viewer.user_id,
      question_id: question_id,
      exam_attempt_id: quiz ? exam_attempt_id : ObjectId(exam_attempt_id),
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

    const question = await QuestionFetch.findById(question_id, viewer);
    if (!question) {
      return {
        completionObj: { code: '1', msg: 'ERROR cannot find question' }
      };
    }

    // is_correct, explain_text, points, pct_score
    let gradingObj = {};
    if (
      question.question_type === 'MCSA' ||
      question.question_type === 'MCMA'
    ) {
      gradingObj = await gradeMCQuestionAnswer(question, response_data, viewer);
    } else {
      // TODO
    }

    questionInteractionInfo.points = gradingObj.points;
    questionInteractionInfo.pct_score = gradingObj.pct_score;
    const { dummy1, qi_record } = await upsertQuestionInteraction(
      questionInteractionInfo
    );

    if (!quiz) {
      const examattempt = await ExamAttemptFetch.findById(
        questionInteractionInfo.exam_attempt_id
      );
      const quesInterIdx = examattempt.question_interaction_ids.findIndex(
        item => item.toString() === qi_record._id.toString()
      );
      if (quesInterIdx === -1) {
        examattempt.question_interaction_ids.push(qi_record._id);
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

    let returnData = {
      question: question,
      is_correct: gradingObj.is_correct,
      explain_text: gradingObj.explain_text,
      completionObj: {
        code: '0',
        msg: ''
      }
    };

    if (!check_answer) {
      // Do not return grading to the client
      returnData.is_correct = false;
      returnData.explain_text = '';
    }

    if (is_last_question) {
      const docRefs = question.doc_ref.EmbeddedDocRef.embedded_doc_refs;
      const courseId = docRefs.find(item => item.level === 'course');
      const unitId = docRefs.find(item => item.level === 'unit');
      const sectionId = docRefs.find(item => item.level === 'section');
      const courseData = await CourseFetch.findById(courseId.doc_id);

      let unitIndex = courseData.units.Units.findIndex(
        item => item._id === unitId.doc_id
      );
      if (unitIndex === -1) {
        unitIndex = 0;
      }
      const currUnit = courseData.units.Units[unitIndex];

      let sectionIdx = currUnit.sections.Sections.findIndex(
        item => item._id === sectionId.doc_id
      );
      if (sectionIdx === -1) {
        sectionIdx = 0;
      }

      const courseTitle = getStringByLocale(courseData.title, viewer.locale);
      returnData.next_question = {
        course_id: toClientUrlId(courseTitle.text, courseData._id)
      };

      let nextUnit;
      let nextSection;

      if (currUnit.sections.Sections[sectionIdx + 1]) {
        nextUnit = currUnit;
        nextSection = currUnit.sections.Sections[sectionIdx + 1];
      } else if (courseData.units.Units[unitIndex + 1]) {
        nextUnit = courseData.units.Units[unitIndex + 1];
        nextSection = nextUnit.sections.Sections[0];
      }

      if (nextUnit && nextSection) {
        const unitTitle = getStringByLocale(nextUnit.title, viewer.locale);
        const sectionTitle = getStringByLocale(
          nextSection.title,
          viewer.locale
        );
        returnData.next_question.unit_id = toClientUrlId(
          unitTitle.text,
          nextUnit._id
        );
        returnData.next_question.section_id = toClientUrlId(
          sectionTitle.text,
          nextSection._id
        );
      }
    }

    return returnData;
  } catch (error) {
    return { completionObj: { code: '1', msg: error.message } };
  }
};

const gradeMCQuestionAnswer = async (question, response_data, viewer) => {
  console.log(`in gradeMCQuestionAnswer`);
  // This will be inside try of the calling routine
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

const gradeMCQuestionAnswer = async (question, response_data, viewer) => {
  console.log(`in gradeMCQuestionAnswer`);
  let is_correct = false;
  let explain_text = '';
  let points = 0;
  let pct_score = 0;

  return { is_correct, explain_text, points, pct_score };
};

import { upsertQuestionInteraction } from '../db-handlers/question-interaction-cud';
import * as QuestionFetch from '../db-handlers/question-fetch';
import { getStringByLocale } from '../parsers/intl-string-parser';
import * as ExamAttemptFetch from '../db-handlers/exam-attempt-fetch';
import * as CourseFetch from '../db-handlers/course/course-fetch';
import { toClientUrlId } from '../utils/client-url';

import mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

export const answerQuestion = async (
  question_id,
  exam_attempt_id,
  response_data,
  check_answer,
  quiz,
  is_quiz_start,
  is_last_question,
  viewer
) => {
  try {
    let updateObject = {
      user_id: viewer.user_id,
      question_id: question_id,
      exam_attempt_id: quiz ? exam_attempt_id : ObjectId(exam_attempt_id),
      is_complete: !quiz, // quiz false by default
      exam_type: quiz ? 'quiz' : 'unit_exam'
    };

    if (is_quiz_start) {
      updateObject.result = '';
      updateObject.$push = { entered_at: new Date() };
    } else {
      updateObject.result = response_data ? 'question_submitted' : 'skipped';
    }

    if (response_data) {
      if (!updateObject.$push) {
        updateObject.$push = {};
      }
      updateObject.$push.response_data = response_data;
    }

    const question = await QuestionFetch.findById(question_id, viewer);
    if (!question) {
      return {
        completionObj: { code: '1', msg: 'ERROR cannot find question' }
      };
    }

    let is_correct = false;
    let explain_text = '';
    if (response_data) {
      updateObject.points = 0;
      updateObject.pct_score = 0;
      if (
        question.question_type == 'MCSA' ||
        question.question_type == 'MCMA'
      ) {
        const answers = response_data.selected_ids.sort(
          (a, b) => a.seq - b.seq
        );
        const corrects = [];
        const options = question.data.sort((a, b) => a.seq - b.seq);
        for (let item of options) {
          if (item.is_answer) {
            corrects.push(item._id.toString());
          }
          const intlText = getStringByLocale(item.explanation, viewer.locale)
            .text;
          explain_text = `${explain_text}${intlText}\n\n`;
        }

        is_correct =
          corrects.length == answers.length &&
          corrects.every(function(u, i) {
            return u === answers[i];
          });
      } else {
        //TBD
      }
    }

    if (question.question_type == 'MCSA' && is_correct) {
      updateObject.points = question.points;
      updateObject.pct_score = 100;
    } else if (question.question_type == 'MCMA' && response_data) {
      const answers = response_data.selected_ids.sort((a, b) => a.seq - b.seq);
      let rightOptions = 0;
      let wrongOptions = 0;
      let totalCorrectAnswers = 0;
      for (let opt of question.data) {
        if (opt.is_answer) totalCorrectAnswers++;
      }
      for (let answer of answers) {
        for (let opt of question.data) {
          if (opt._id.toString() === answer) {
            if (opt.is_answer) {
              rightOptions += 1;
            } else {
              wrongOptions += 1;
            }
            break;
          }
        }
      }

      const tmpScore = rightOptions - wrongOptions;
      if (tmpScore >= 0) {
        updateObject.points = tmpScore;
      }
      updateObject.pct_score = updateObject.points / totalCorrectAnswers * 100;
    } else {
      // TBD
    }

    const { result, record } = await upsertQuestionInteraction(updateObject);

    if (!quiz) {
      const examattempt = await ExamAttemptFetch.findById(
        updateObject.exam_attempt_id
      );
      const quesInterIdx = examattempt.question_interaction_ids.findIndex(
        item => item.toString() == record._id.toString()
      );
      if (quesInterIdx == -1) {
        examattempt.question_interaction_ids.push(record._id);
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
      completionObj: {
        code: '0',
        msg: '',
        processed: result.n,
        modified: result.nModified
      }
    };

    if (check_answer) {
      returnData.is_correct = is_correct;
      returnData.explain_text = explain_text;
    }

    if (is_last_question) {
      const docRefs = question.doc_ref.EmbeddedDocRef.embedded_doc_refs;
      const courseId = docRefs.find(item => item.level === 'course');
      const unitId = docRefs.find(item => item.level === 'unit');
      const sectionId = docRefs.find(item => item.level === 'section');
      const courseData = await CourseFetch.findById(courseId.doc_id);

      let unitIndex = courseData.units.Units.findIndex(
        item => item._id == unitId.doc_id
      );
      if (unitIndex == -1) {
        unitIndex = 0;
      }
      const currUnit = courseData.units.Units[unitIndex];

      let sectionIdx = currUnit.sections.Sections.findIndex(
        item => item._id == sectionId.doc_id
      );
      if (sectionIdx == -1) {
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

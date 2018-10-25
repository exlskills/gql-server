import { logger } from '../utils/logger';
import * as QuestionFetch from '../db-handlers/question-fetch';
import { QUESTION_TYPES } from '../db-models/question-model';
import {
  gradeMCQuestionAnswer,
  gradeWSCQQuestionAnswer
} from '../utils/question-answer-grading';
import { processExamQuestionInteraction } from '../db-handlers/question-interaction-cud';

export const processCardQuestionAction = async (
  question_id,
  response_data,
  check_answer,
  quiz,
  is_quiz_start,
  is_last_question,
  viewer
) => {
  logger.debug(`in processCardQuestionAction`);
  logger.debug(`   question_id ` + question_id);
  logger.debug(`   response_data ` + response_data);

  const received_at = new Date();

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

    // is_correct, explain_text, points, pct_score
    let gradingObj = {
      is_correct: false,
      explain_text: '',
      grading_response: ''
    };

    if (
      question.question_type === QUESTION_TYPES.MULT_CHOICE_SINGLE_ANSWER ||
      question.question_type === QUESTION_TYPES.MULT_CHOICE_MULT_ANSWERS
    ) {
      gradingObj = await gradeMCQuestionAnswer(question, response_data, viewer);
    } else if (
      question.question_type === QUESTION_TYPES.WRITE_SOFTWARE_CODE_QUESTION
    ) {
      gradingObj = await gradeWSCQQuestionAnswer(
        question,
        response_data,
        viewer
      );
    } else {
      logger.error(
        'Grading logic not implemented for question type ' +
          question.question_type
      );
      return {
        completionObj: {
          code: '1',
          msg: 'Grading failed',
          msg_id: 'grading_issue'
        }
      };
    }
    // Do not wait for this
    processExamQuestionInteraction(
      viewer.user_id,
      question_id,
      null,
      received_at,
      response_data,
      {
        result: response_data ? 'answer_submitted' : 'skipped',
        points: gradingObj.points,
        pct_score: gradingObj.pct_score
      }
    );

    returnData.is_correct = gradingObj.is_correct;
    returnData.explain_text = gradingObj.explain_text;
    returnData.grading_response = gradingObj.grading_response;

    /*
    DEPRECATED

    if (is_last_question) {
      const courseData = await fetchById(question.course_item_ref.course_id, {
        title: 1
      });

      let fetchParameters = {
        courseId: question.course_item_ref.course_id,
        unitId: question.course_item_ref.unit_id
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
        item => item._id === question.course_item_ref.section_id
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
   */

    logger.debug(
      `processQuestionAction returnData ` + JSON.stringify(returnData)
    );
    return returnData;
  } catch (error) {
    logger.error(`In processCardQuestionAction ` + error);
    return {
      completionObj: {
        code: '1',
        msg: 'Processing failed',
        msg_id: 'process_failed'
      }
    };
  }
};

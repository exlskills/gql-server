import { basicFind } from '../db-handlers/basic-query-handler';
import Exam from '../db-models/exam-model.js';
import { checkUserTookThisExam } from './exam-attempt-fetch';
import Course from '../db-models/course-model';
import { logger } from '../utils/logger';
import * as Randomization from '../utils/randomization';

export const fetchById = async (obj_id, selectVal, viewer, info) => {
  logger.debug(`in Exam fetchById`);
  let record;
  try {
    //model, runParams, queryVal, sortVal, selectVal
    record = await basicFind(Exam, { isById: true }, obj_id, null, selectVal);
  } catch (errInternalAlreadyReported) {
    return null;
  }
  return record;
};

export const searchExamIdToTake = async (unit_id, course_id, viewer, info) => {
  logger.debug(`in searchExamIdToTake`);
  let array = [];
  let elem;
  elem = { $match: { _id: course_id } };
  array.push(elem);

  elem = {
    $addFields: {
      'units.Units.sections.Sections.cards.currentCourseId': '$_id'
    }
  };
  array.push(elem);

  elem = { $replaceRoot: { newRoot: '$units' } };
  array.push(elem);
  elem = {
    $project: {
      Units: {
        $filter: {
          input: '$Units',
          cond: { $eq: ['$$this._id', unit_id] }
        }
      }
    }
  };
  array.push(elem);
  elem = { $unwind: '$Units' };
  array.push(elem);
  elem = {
    $project: {
      final_exams: '$Units.final_exams'
    }
  };
  array.push(elem);
  const response = await Course.aggregate(array).exec();
  if (response.length <= 0) {
    return Promise.reject('Course Unit has no Exams defined');
  }
  let arrayExam = response[0].final_exams;
  let lengthExam = arrayExam.length;
  let j = Math.floor(Math.random() * (lengthExam - 1));
  let idToTake = arrayExam[j];
  let examIdAssigned = false;
  for (let i = j; i < lengthExam; i++) {
    if (!(await checkUserTookThisExam(arrayExam[i], viewer.user_id, unit_id))) {
      idToTake = arrayExam[i];
      examIdAssigned = true;
      break;
    }
  }
  if (!examIdAssigned) {
    for (let i = j - 1; i >= 0; i--) {
      if (
        !(await checkUserTookThisExam(arrayExam[i], viewer.user_id, unit_id))
      ) {
        idToTake = arrayExam[i];
        examIdAssigned = true;
        break;
      }
    }
  }
  logger.debug(`exam id to take ` + idToTake);
  return idToTake;
};

async function getRandomQuestionIds(exam_id) {
  const exam = await fetchById(exam_id, { question_ids: 1, question_count: 1 });
  let secret_seed = Randomization.make_random_string();
  let arrayQuestion = Randomization.shuffleArray(
    exam.question_ids,
    secret_seed
  );
  if (exam.question_count && exam.question_count > 0) {
    arrayQuestion.splice(exam.question_count);
  }
  return { quesIds: arrayQuestion, seed: secret_seed };
}

export const returnObjectExamAttempt = async (
  unit_id,
  course_id,
  viewer,
  info
) => {
  logger.debug(`in returnObjectExamAttempt`);
  let exam_id = await searchExamIdToTake(unit_id, course_id, viewer, info);
  let { quesIds, seed } = await getRandomQuestionIds(exam_id);
  let started_at = new Date();
  return {
    exam_id: exam_id,
    arrayQuestion: quesIds,
    seed: seed,
    started_at: started_at,
    question_count: quesIds.length
  };
};

export const getOneExam = async (unit_id, course_id, viewer, info) => {
  logger.debug(`in getOneExam`);
  let exam_id = await searchExamIdToTake(unit_id, course_id, viewer, info);
  return exam_id;
};

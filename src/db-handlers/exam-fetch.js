import { basicFind } from '../db-handlers/basic-query-handler';
import Exam from '../db-models/exam-model.js';
import ExamAttempt from '../db-models/exam-attempt-model';
import Course from '../db-models/course-model';

export const findById = async (obj_id, viewer, info) => {
  console.log(`in Exam findById`);
  let record;
  try {
    //model, runParams, queryVal, sortVal, selectVal
    record = await basicFind(Exam, { isById: true }, obj_id);
  } catch (errInternalAllreadyReported) {
    return null;
  }
  return record;
};

async function getNextExam(exam_id, user_id, unit_id) {
  console.log(`in getNextExam`);
  let array = [];
  let elem;
  elem = { $match: { exam_id: exam_id, unit_id: unit_id, user_id: user_id } };
  array.push(elem);
  const response = await ExamAttempt.aggregate(array).exec();
  return response.length > 0;
}

function RNG(seed) {
  // LCG using GCC's constants
  this.m = 0x80000000; // 2**31;
  this.a = 1103515245;
  this.c = 12345;

  this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));
}
RNG.prototype.nextInt = function() {
  this.state = (this.a * this.state + this.c) % this.m;
  return this.state;
};
RNG.prototype.nextFloat = function() {
  // returns in range [0,1]
  return this.nextInt() / (this.m - 1);
};
RNG.prototype.nextRange = function(start, end) {
  // returns in range [start, end): including start, excluding end
  // can't modulu nextInt because of weak randomness in lower bits
  let rangeSize = end - start;
  let randomUnder1 = this.nextInt() / this.m;
  return start + Math.floor(randomUnder1 * rangeSize);
};
RNG.prototype.choice = function(array) {
  return array[this.nextRange(0, array.length)];
};

function shuffleArray(array, seed) {
  let shuffled = [...array];
  let rng = new RNG(seed);

  for (let i = shuffled.length - 1; i > 1; i--) {
    let r = Math.floor(rng.nextFloat() * i);
    let t = shuffled[i];
    shuffled[i] = shuffled[r];
    shuffled[r] = t;
  }
  return shuffled;
}

function make_random_string() {
  let text = '';
  let possible = '0123456789';

  for (let i = 0; i < 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

async function getLocatedExamId(unit_id, course_id, viewer, info) {
  console.log(`in getLocatedExamId`);
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
  if (response.length > 0) {
    let arrayExam = response[0].final_exams;
    let lengthExam = arrayExam.length;
    let randomN = Math.floor(Math.random() * (lengthExam - 1));
    let id_not_attemp = '';
    let i = randomN;
    for (; i < lengthExam; i++) {
      const exam_id = arrayExam[i];
      const user_id = viewer.user_id;
      if (!(await getNextExam(exam_id, user_id, unit_id))) {
        id_not_attemp = exam_id;
        return id_not_attemp;
      }
    }
    id_not_attemp = arrayExam[0];
    return id_not_attemp;
  }
}

async function getRandomQuestionIds(exam_id) {
  const exam = await findById(exam_id);
  let secret_seed = make_random_string();
  let arrayQuestion = shuffleArray(exam.question_ids, secret_seed);
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
  console.log(`in returnObjectExamAttempt`);
  let exam_id = await getLocatedExamId(unit_id, course_id, viewer, info);
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
  console.log(`in getOneExam`);
  let exam_id = await getLocatedExamId(unit_id, course_id, viewer, info);
  return exam_id;
};

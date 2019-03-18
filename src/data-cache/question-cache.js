import { logger } from '../utils/logger';
import { basicFind } from '../db-handlers/basic-query-handler';
import Question, { QUESTION_TYPES } from '../db-models/question-model';
import { questionCache } from './cache-objects';
import { sizeof } from '../utils/calc-field-size';
import { getIntlStringFieldsOfObject } from './misc-cache';

export async function loadCardQuestionCache(question_ids, locales) {
  if (!question_ids || question_ids.length < 1) {
    return;
  }

  logger.debug(`In loadCardQuestionCache`);

  let objSize = 0;

  for (let qId of question_ids) {
    delete questionCache[qId];
  }

  const intlStringFields = ['question_text', 'hint'];
  const intlStringFieldsDataWSCQ = ['src_files', 'tmpl_files', 'explanation'];
  const intlStringFieldsDataMC = ['text', 'explanation'];

  let questionsDbObj = await basicFind(
    Question,
    null,
    { _id: { $in: question_ids } },
    { _id: 1 },
    null
  );

  if (!questionsDbObj || questionsDbObj.length < 1) {
    logger.error(`questions listed in the card are not found in the DB`);
    return;
  }

  for (let quest of questionsDbObj) {
    quest = quest.toObject();
    const questObj = {
      question_type: quest.question_type,
      points: quest.points,
      compl_level: quest.compl_level,
      est_time_sec: quest.est_time_sec,
      tags: quest.tags,
      exam_only: quest.exam_only,
      course_item_ref: quest.course_item_ref
    };
    objSize += sizeof(questObj);

    const intlStringFieldsObj = getIntlStringFieldsOfObject(
      quest,
      intlStringFields,
      locales
    );
    objSize += intlStringFieldsObj.size;
    questObj.locale_data = intlStringFieldsObj.data;

    questObj.data = {};
    objSize += sizeof('data');

    if (quest.question_type === QUESTION_TYPES.WRITE_SOFTWARE_CODE_QUESTION) {
      questObj.data.api_version = quest.data.api_version;
      questObj.data.environment_key = quest.data.environment_key;
      questObj.data.grading_strategy = quest.data.grading_strategy;
      questObj.data.grading_tests = quest.data.grading_tests;
      const intlStringFieldsDataWSCQObj = getIntlStringFieldsOfObject(
        quest.data,
        intlStringFieldsDataWSCQ,
        locales
      );
      objSize += intlStringFieldsDataWSCQObj.size;
      questObj.data.locale_data = intlStringFieldsDataWSCQObj.data;
    } else if (
      quest.question_type === QUESTION_TYPES.MULT_CHOICE_SINGLE_ANSWER ||
      quest.question_type === QUESTION_TYPES.MULT_CHOICE_MULT_ANSWERS
    ) {
      for (let questData of quest.data) {
        const questDataObj = {
          seq: questData.seq,
          is_answer: questData.is_answer
        };
        const intlStringFieldsDataMCObj = getIntlStringFieldsOfObject(
          questData,
          intlStringFieldsDataMC,
          locales
        );
        objSize += intlStringFieldsDataMCObj.size;
        questDataObj.locale_data = intlStringFieldsDataMCObj.data;

        questObj.data[questData._id] = questDataObj;
      }
    } else {
      logger.error('Unsupported question type ' + quest.question_type);
    }
    questionCache[quest._id] = questObj;
    logger.debug(`question cache obj ` + JSON.stringify(questObj));
  }
}

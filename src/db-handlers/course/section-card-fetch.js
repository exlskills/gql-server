import Course from '../../db-models/course-model';
import * as QuestionFetch from '../question/question-fetch';
import * as projectionWriter from '../../utils/projection-writer';
import { logger } from '../../utils/logger';
import { fetchQuestionsGeneric } from '../question/question-fetch';
import { QUESTION_TYPES } from '../../db-models/question-model';
import {
  cardContentCache,
  questionCache,
  courseCache,
  courseStructureCache
} from '../../data-cache/cache-objects';
import { isSectionInCache } from '../../data-cache/course-structure-cache';
import { getCourseUserLocale } from '../../data-cache/course-cache';

export const fetchCardDetailsById = async (
  courseId,
  unitId,
  sectionId,
  cardId,
  viewerLocale
) => {
  logger.debug(`in fetchCardDetailsById`);
  let array = [];
  let selectFields = {};

  // Find the course
  array.push({ $match: { _id: courseId } });

  // Find the unit
  array.push({
    $project: {
      ...selectFields,
      currentCourseId: '$_id',
      unit: {
        $filter: {
          input: '$units.Units',
          cond: { $eq: ['$$this._id', unitId] }
        }
      }
    }
  });
  array.push({ $unwind: '$unit' });
  selectFields.currentCourseId = 1;

  // Find the section
  array.push({
    $project: {
      ...selectFields,
      currentUnitId: '$unit._id',
      section: {
        $filter: {
          input: '$unit.sections.Sections',
          cond: { $eq: ['$$this._id', sectionId] }
        }
      }
    }
  });
  array.push({ $unwind: '$section' });
  selectFields.currentUnitId = 1;

  // Find the card
  array.push({
    $project: {
      ...selectFields,
      currentSectionId: '$section._id',
      cards: {
        $filter: {
          input: '$section.cards.Cards',
          cond: { $eq: ['$$this._id', cardId] }
        }
      }
    }
  });
  selectFields.currentSectionId = 1;

  // Prepare card data
  array.push({ $unwind: '$cards' });
  array.push({
    $project: {
      ...selectFields,
      'title.intlString': projectionWriter.writeIntlStringFilter(
        'cards.title',
        viewerLocale
      ),
      'headline.intlString': projectionWriter.writeIntlStringFilter(
        'cards.headline',
        viewerLocale
      ),
      _id: '$cards._id',
      index: '$cards.index',
      content_id: '$cards.content_id',
      tags: '$cards.tags',
      // question_ids: '$cards.question_ids',
      github_edit_url: '$cards.github_edit_url',
      updated_at: '$cards.updated_at'
    }
  });
  selectFields._id = 1;
  selectFields.index = 1;
  selectFields.content_id = 1;
  selectFields.tags = 1;
  // selectFields.question_ids = 1;
  selectFields.github_edit_url = 1;
  selectFields.updated_at = 1;

  array.push({
    $project: {
      ...selectFields,
      title: projectionWriter.writeIntlStringEval('title', viewerLocale),
      headline: projectionWriter.writeIntlStringEval('headline', viewerLocale)
    }
  });
  selectFields.title = 1;
  selectFields.headline = 1;

  // lookup for content
  array.push({
    $lookup: {
      from: 'versioned_content',
      localField: 'content_id',
      foreignField: '_id',
      as: 'content'
    }
  });
  array.push({ $unwind: '$content' });
  delete selectFields.content_id;

  // get latest content version if not asked
  array.push({
    $project: {
      ...selectFields,
      content: {
        $filter: {
          input: '$content.contents',
          cond: {
            $eq: ['$$this.version', '$content.latest_version']
          }
        }
      }
    }
  });
  array.push({ $unwind: '$content' });

  // get content by locale
  array.push({
    $project: {
      ...selectFields,
      'content._id': 1,
      'content.version': 1,
      'content.content.intlString': projectionWriter.writeIntlStringFilter(
        'content.content',
        viewerLocale
      )
    }
  });
  array.push({
    $project: {
      ...selectFields,
      'content._id': 1,
      'content.version': 1,
      'content.content': projectionWriter.writeIntlStringEval(
        'content.content',
        viewerLocale
      )
    }
  });
  selectFields.content = 1;

  const result = await Course.aggregate(array).exec();
  return result.length > 0 ? result[0] : {};
};

export const fetchCardByQuestionId = async (questionId, viewerLocale) => {
  logger.debug(`in fetchCardByQuestionId`);
  const question = await QuestionFetch.fetchById(questionId, {
    course_item_ref: 1
  });
  if (!question) {
    logger.debug(` question not found `);
    return {};
  }

  //logger.debug(` course_item_ref ` + JSON.stringify(question.course_item_ref));

  if (
    !question.course_item_ref.course_id ||
    !question.course_item_ref.unit_id ||
    !question.course_item_ref.section_id ||
    !question.course_item_ref.card_id
  ) {
    logger.debug(` not a card-level question `);
    return {};
  }

  const result = await fetchCardDetailsById(
    question.course_item_ref.course_id,
    question.course_item_ref.unit_id,
    question.course_item_ref.section_id,
    question.course_item_ref.card_id,
    viewerLocale
  );
  return result;
};

export const fetchSectionCards = async (
  filterValues,
  aggregateArray,
  viewerLocale,
  fetchParameters
) => {
  logger.debug(`in fetchSectionCards`);
  logger.debug(`  course_ID ` + fetchParameters.courseId);
  logger.debug(`  unit_ID ` + fetchParameters.unitId);
  logger.debug(`  section_ID ` + fetchParameters.sectionId);
  logger.debug(`  card_ID ` + fetchParameters.cardId);
  let sort = { $sort: { index: 1 } };
  let skip = aggregateArray.find(item => !!item.$skip);
  let limit = aggregateArray.find(item => !!item.$limit);

  let array = [];
  let selectFields = {};

  // Find the course
  array.push({ $match: { _id: fetchParameters.courseId } });

  // Find the unit
  array.push({
    $project: {
      ...selectFields,
      currentCourseId: '$_id',
      unit: {
        $filter: {
          input: '$units.Units',
          cond: { $eq: ['$$this._id', fetchParameters.unitId] }
        }
      }
    }
  });
  array.push({ $unwind: '$unit' });
  selectFields.currentCourseId = 1;

  // Find the section
  array.push({
    $project: {
      ...selectFields,
      currentUnitId: '$unit._id',
      section: {
        $filter: {
          input: '$unit.sections.Sections',
          cond: { $eq: ['$$this._id', fetchParameters.sectionId] }
        }
      }
    }
  });
  array.push({ $unwind: '$section' });
  selectFields.currentUnitId = 1;

  // Find the actual card if asked, otherwise fetch all cards
  array.push({
    $project: {
      ...selectFields,
      currentSectionId: '$section._id',
      cards: {
        $cond: [
          { $ne: [fetchParameters.cardId, undefined] },
          {
            $filter: {
              input: '$section.cards.Cards',
              cond: { $eq: ['$$this._id', fetchParameters.cardId] }
            }
          },
          '$section.cards.Cards'
        ]
      }
    }
  });
  selectFields.currentSectionId = 1;

  // Prepare card data
  array.push({ $unwind: '$cards' });
  array.push({
    $project: {
      ...selectFields,
      'title.intlString': projectionWriter.writeIntlStringFilter(
        'cards.title',
        viewerLocale
      ),
      'headline.intlString': projectionWriter.writeIntlStringFilter(
        'cards.headline',
        viewerLocale
      ),
      _id: '$cards._id',
      index: '$cards.index',
      content_id: '$cards.content_id',
      tags: '$cards.tags',
      question_ids: '$cards.question_ids',
      github_edit_url: '$cards.github_edit_url',
      updated_at: '$cards.updated_at'
    }
  });
  selectFields._id = 1;
  selectFields.index = 1;
  selectFields.content_id = 1;
  selectFields.tags = 1;
  selectFields.question_ids = 1;
  selectFields.github_edit_url = 1;
  selectFields.updated_at = 1;

  array.push({
    $project: {
      ...selectFields,
      title: projectionWriter.writeIntlStringEval('title', viewerLocale),
      headline: projectionWriter.writeIntlStringEval('headline', viewerLocale)
    }
  });
  selectFields.title = 1;
  selectFields.headline = 1;

  // lookup for content
  array.push({
    $lookup: {
      from: 'versioned_content',
      localField: 'content_id',
      foreignField: '_id',
      as: 'content'
    }
  });
  array.push({ $unwind: '$content' });
  delete selectFields.content_id;

  // get latest content version if not asked
  fetchParameters.version = fetchParameters.version
    ? fetchParameters.version
    : 0;

  array.push({
    $project: {
      ...selectFields,
      content: {
        $filter: {
          input: '$content.contents',
          cond: {
            $eq: [
              '$$this.version',
              {
                $cond: [
                  { $gt: [fetchParameters.version, 0] },
                  fetchParameters.version,
                  '$content.latest_version'
                ]
              }
            ]
          }
        }
      }
    }
  });
  array.push({ $unwind: '$content' });

  // get content by locale
  array.push({
    $project: {
      ...selectFields,
      'content._id': 1,
      'content.version': 1,
      'content.content.intlString': projectionWriter.writeIntlStringFilter(
        'content.content',
        viewerLocale
      )
    }
  });
  array.push({
    $project: {
      ...selectFields,
      'content._id': 1,
      'content.version': 1,
      'content.content': projectionWriter.writeIntlStringEval(
        'content.content',
        viewerLocale
      )
    }
  });
  selectFields.content = 1;

  if (sort) array.push(sort);
  if (skip) array.push(skip);
  if (limit) array.push(limit);

  const result = await Course.aggregate(array).exec();
  logger.debug(`fetched cards raw ` + JSON.stringify(result));

  for (let card of result) {
    logger.debug(`card quest ids ` + card.question_ids);
    let questionFilterArrayElem = {
      $match: { _id: { $in: card.question_ids } }
    };
    let questionsFilterArray = [];
    questionsFilterArray.push(questionFilterArrayElem);

    let cardQuestions = await fetchQuestionsGeneric(
      questionsFilterArray,
      null,
      null,
      null,
      viewerLocale
    );

    // pick a random question to show
    card.question =
      cardQuestions[Math.floor(Math.random() * cardQuestions.length)];

    // add question ID into `data` for MC questions
    for (let question of cardQuestions) {
      if (
        question.question_type === QUESTION_TYPES.MULT_CHOICE_SINGLE_ANSWER ||
        question.question_type === QUESTION_TYPES.MULT_CHOICE_MULT_ANSWERS
      ) {
        question.data._id = question._id;
      }
    }

    card.questions = cardQuestions;
  }

  delete result.question_ids;

  logger.debug(`  fetchSectionCards result ` + JSON.stringify(result));

  return result;
};

export const fetchSectionCardIDsForUnit = async (course_id, unit_id) => {
  logger.debug(`in fetchSectionCardIDsForUnit`);

  let array = [];

  // Find the course
  array.push({ $match: { _id: course_id } });

  // Find the unit
  array.push({
    $project: {
      unit: {
        $filter: {
          input: '$units.Units',
          cond: { $eq: ['$$this._id', unit_id] }
        }
      }
    }
  });
  array.push({ $unwind: '$unit' });

  array.push({
    $project: {
      'unit.sections.Sections._id': 1,
      'unit.sections.Sections.cards.Cards._id': 1,
      'unit.sections.Sections.cards.Cards.question_ids': 1
    }
  });

  let result = await Course.aggregate(array).exec();
  logger.debug(
    `   fetchSectionCardIDsForUnit result ` + JSON.stringify(result)
  );

  return result[0];
};

export const scrollToCard = async (scrollingDir, fetchParameters) => {
  logger.debug(`in scrollToCard`);
  // FUTURE - call fetchSectionsCardIDs and navigate the the next or prev
  // Currently, the evaluation is done on the client
  return fetchParameters;
};

export const fetchCourseItemRefByCourseUnitCardId = async (
  courseId,
  unitId,
  cardId
) => {
  logger.debug(`in fetchCourseItemRefByCourseUnitCardId`);
  let array = [];
  let selectFields = {};

  // Find the course
  array.push({ $match: { _id: courseId } });

  // Find the unit
  array.push({
    $project: {
      ...selectFields,
      unit: {
        $filter: {
          input: '$units.Units',
          cond: { $eq: ['$$this._id', unitId] }
        }
      }
    }
  });
  array.push({ $unwind: '$unit' });

  // Unwind Unit Sections
  array.push({
    $project: {
      ...selectFields,
      section: '$unit.sections.Sections'
    }
  });
  array.push({ $unwind: '$section' });

  // Find the card
  array.push({
    $project: {
      ...selectFields,
      cards: {
        $filter: {
          input: '$section.cards.Cards',
          cond: { $eq: ['$$this._id', cardId] }
        }
      }
    }
  });

  // Prepare card data
  array.push({ $unwind: '$cards' });
  array.push({
    $project: {
      ...selectFields,
      course_item_ref: '$cards.course_item_ref'
    }
  });

  try {
    const result = await Course.aggregate(array).exec();
  } catch (err) {
    logger.error(`in fetchCourseItemRefByCourseUnitCardId ` + err);
    return null;
  }
  return result.length > 0 ? result[0] : null;
};

export const fetchSectionCardIDsForUnitCache = async (course_id, unit_id) => {
  logger.debug(`in fetchSectionCardIDsForUnitCache`);

  const result = { _id: course_id, unit: { sections: { Sections: [] } } };

  if (
    !courseStructureCache[course_id] ||
    !courseStructureCache[course_id].units ||
    !courseStructureCache[course_id].units.get(unit_id)
  ) {
    logger.error(
      `course - unit not in Course Structure cache ` + course_id + ` ` + unit_id
    );
    return await fetchSectionCardIDsForUnit(course_id, unit_id);
  }

  for (let sectionId of courseStructureCache[course_id].units
    .get(unit_id)
    .sections.keys()) {
    const sectionObj = { _id: sectionId, cards: { Cards: [] } };

    for (let cardId of courseStructureCache[course_id].units
      .get(unit_id)
      .sections.get(sectionId)
      .cards.keys()) {
      const cardObj = {
        _id: cardId,
        question_ids: courseStructureCache[course_id].units
          .get(unit_id)
          .sections.get(sectionId)
          .cards.get(cardId).question_ids
      };
      sectionObj.cards.Cards.push(cardObj);
    } // On Cards
    result.unit.sections.Sections.push(sectionObj);
  } // On Sections

  logger.debug(
    `   fetchSectionCardIDsForUnitCache result ` + JSON.stringify(result)
  );
  return result;
};

export const fetchSectionCardsCache = async (
  filterValues,
  aggregateArray,
  viewerLocale,
  fetchParameters
) => {
  logger.debug(`in fetchSectionCardsCache`);
  logger.debug(`  course_ID ` + fetchParameters.courseId);
  logger.debug(`  unit_ID ` + fetchParameters.unitId);
  logger.debug(`  section_ID ` + fetchParameters.sectionId);
  logger.debug(`  card_ID ` + fetchParameters.cardId);

  if (
    !isSectionInCache(
      fetchParameters.courseId,
      fetchParameters.unitId,
      fetchParameters.sectionId
    )
  ) {
    logger.error(
      ` course-unit-section missing from cache ` +
        fetchParameters.courseId +
        ` ` +
        fetchParameters.unitId +
        ` ` +
        fetchParameters.sectionId
    );
    return await fetchSectionCards(
      filterValues,
      aggregateArray,
      viewerLocale,
      fetchParameters
    );
  }

  try {
    let result = [];

    const locale = getCourseUserLocale(viewerLocale, fetchParameters.courseId);

    let skip = aggregateArray.find(item => !!item.$skip);
    let limit = aggregateArray.find(item => !!item.$limit);

    for (let cardId of courseStructureCache[fetchParameters.courseId].units
      .get(fetchParameters.unitId)
      .sections.get(fetchParameters.sectionId)
      .cards.keys()) {
      if (fetchParameters.cardId && fetchParameters.cardId !== cardId) {
        continue;
      } else if (skip && skip.$skip > 0) {
        skip.$skip--;
        continue;
      } else if (limit) {
        if (limit.$limit <= 0) {
          break;
        }
        limit.$limit--;
      }

      const cardElem = {
        currentCourseId: fetchParameters.courseId,
        currentUnitId: fetchParameters.unitId,
        currentSectionId: fetchParameters.sectionId,
        _id: cardId
      };

      const card = courseStructureCache[fetchParameters.courseId].units
        .get(fetchParameters.unitId)
        .sections.get(fetchParameters.sectionId)
        .cards.get(cardId);

      cardElem.index = card.index;
      cardElem.tags = card.tags;
      cardElem.question_ids = card.question_ids;
      cardElem.github_edit_url = card.github_edit_url;
      cardElem.updated_at = card.updated_at;
      cardElem.question_ids = card.question_ids;

      cardElem.title = card.locale_data[locale].title;
      cardElem.headline = card.locale_data[locale].headline;

      cardElem.content = { _id: card.content_id, version: 0, content: '' };

      if (cardContentCache[cardId]) {
        if (
          !fetchParameters.version ||
          fetchParameters.version === cardContentCache[cardId].latest_version
        ) {
          cardElem.content.version = cardContentCache[cardId].latest_version;
          cardElem.content.content =
            cardContentCache[cardId].locale_data[locale].content;
        } else {
          cardElem.content.version =
            cardContentCache[cardId].fetchParameters.version;
          if (
            cardContentCache[cardId][fetchParameters.version] &&
            cardContentCache[cardId][fetchParameters.version].locale_data &&
            cardContentCache[cardId][fetchParameters.version].locale_data[
              locale
            ]
          ) {
            cardElem.content.content =
              cardContentCache[cardId][fetchParameters.version].locale_data[
                locale
              ].content;
          }
        }
      } else {
        logger.error(`cardContentCache not loaded for ` + cardId);
      }

      cardElem.questions = [];
      if (card.question_ids && card.question_ids.length > 0) {
        for (let questionId of card.question_ids) {
          const questCacheElem = questionCache[questionId];
          if (!questCacheElem) {
            logger.error(`questionCache not loaded for ` + questionId);
            continue;
          }
          const questionElem = {
            _id: questionId,
            question_type: questCacheElem.question_type,
            course_item_ref: questCacheElem.course_item_ref,
            hint_exists: false
          };
          questionElem.question_text =
            questCacheElem.locale_data[locale].question_text;
          if (questCacheElem.locale_data[locale].hint) {
            questionElem.hint_exists = true;
          }

          if (
            questCacheElem.question_type ===
            QUESTION_TYPES.WRITE_SOFTWARE_CODE_QUESTION
          ) {
            questionElem.data = {
              api_version: questCacheElem.data.get(1).api_version,
              environment_key: questCacheElem.data.get(1).environment_key,
              tmpl_files: questCacheElem.data.get(1).locale_data[locale]
                .tmpl_files
            };
          } else {
            // This covers MC questions
            questionElem.data = { _id: questionId, options: [] };
            for (let optionId of questCacheElem.data.keys()) {
              const optionCache = questCacheElem.data.get(optionId);
              const option = {
                _id: optionId,
                seq: optionCache.seq,
                text: optionCache.locale_data[locale].text
              };
              questionElem.data.options.push(option);
            } // On options
          } // On Q type
          cardElem.questions.push(questionElem);
        } // On questions

        // Pick Random Q to show
        cardElem.question =
          cardElem.questions[
            Math.floor(Math.random() * cardElem.questions.length)
          ];
      }
      result.push(cardElem);
    } // On cards

    logger.debug(`  fetchSectionCardsCache result ` + JSON.stringify(result));

    return result;
  } catch (err) {
    logger.error(
      ` in fetchSectionCardsCache for course-unit-section ` +
        fetchParameters.courseId +
        ` ` +
        fetchParameters.unitId +
        ` ` +
        fetchParameters.sectionId +
        ` ` +
        err
    );
    return await fetchSectionCards(
      filterValues,
      aggregateArray,
      viewerLocale,
      fetchParameters
    );
  }
};

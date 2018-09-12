import Course from '../../db-models/course-model';
import * as QuestionFetch from '../../db-handlers/question-fetch';
import * as projectionWriter from '../../utils/projection-writer';
import { logger } from '../../utils/logger';
import { fetchQuestionsGeneric } from '../question-fetch';

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
      tags: '$cards.tags'
      // question_ids: '$cards.question_ids',
    }
  });
  selectFields._id = 1;
  selectFields.index = 1;
  selectFields.content_id = 1;
  selectFields.tags = 1;
  // selectFields.question_ids = 1;

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
  const question = await QuestionFetch.fetchById(questionId, { doc_ref: 1 });
  if (!question) {
    return {};
  }

  const docRefs = question.doc_ref.EmbeddedDocRef.embedded_doc_refs;
  const course = docRefs.find(item => item.level === 'course');
  const unit = docRefs.find(item => item.level === 'unit');
  const section = docRefs.find(item => item.level === 'section');
  const card = docRefs.find(item => item.level === 'card');

  if (!course || !unit || !section || !card) {
    return {};
  }

  const result = await fetchCardDetailsById(
    course.doc_id,
    unit.doc_id,
    section.doc_id,
    card.doc_id,
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
      question_ids: '$cards.question_ids'
    }
  });
  selectFields._id = 1;
  selectFields.index = 1;
  selectFields.content_id = 1;
  selectFields.tags = 1;
  selectFields.question_ids = 1;

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
        question.question_type === 'MCSA' ||
        question.question_type === 'MCMA'
      ) {
        question.data._id = question._id;
      }
    }

    card.questions = cardQuestions;
  }

  delete result.question_ids;

  logger.debug(`result with qs ` + JSON.stringify(result));

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
  logger.debug(`   fetched cards with question ID ` + JSON.stringify(result));

  return result[0];
};

export const fetchSectionsCardIDs = async (course_id, unit_id, section_id) => {
  logger.debug(`in fetchSectionsCardIDs`);

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

  // Find the section
  array.push({
    $project: {
      section: {
        $filter: {
          input: '$unit.sections.Sections',
          cond: { $eq: ['$$this._id', section_id] }
        }
      }
    }
  });
  array.push({ $unwind: '$section' });

  array.push({
    $project: {
      'section.cards.Cards._id': 1,
      'section.cards.Cards.index': 1
    }
  });

  let result = await Course.aggregate(array).exec();
  logger.debug(`   section's fetched cards ` + JSON.stringify(result));

  return result[0];
};

export const scrollToCard = async (scrollingDir, fetchParameters) => {
  logger.debug(`in scrollToCard`);
  // FUTURE - call fetchSectionsCardIDs and navigate the the next or prev
  // Currently, the evaluation is done on the client
  return fetchParameters;
};

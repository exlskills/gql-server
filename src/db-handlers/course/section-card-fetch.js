import Course from '../../db-models/course-model';
import * as QuestionFetch from '../../db-handlers/question-fetch';
import Question from '../../db-models/question-model';
import * as projectionWriter from '../../utils/projection-writer';
import { logger } from '../../utils/logger';

export const findById = async (
  courseId,
  unitId,
  sectionId,
  cardId,
  viewerLocale
) => {
  logger.debug(`in Section Card findById`);
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

  let result = await Course.aggregate(array).exec();
  return result.length > 0 ? result[0] : {};
};

export const fetchCardByQuestionId = async (questionId, viewerLocale) => {
  logger.debug(`in fetchCardByQuestionId`);
  const question = await QuestionFetch.findById(questionId);
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

  const result = await findById(
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

  // Pull all card's questions data using lookup
  // TODO: consider pulling questions separately to filter Q's content by Locale and required fields
  array.push({
    $lookup: {
      from: 'question',
      localField: 'question_ids',
      foreignField: '_id',
      as: 'questionsList'
    }
  });
  delete selectFields.question_ids;

  // filter for output fields
  array.push({
    $project: {
      ...selectFields,
      questionsList: 1
    }
  });

  if (sort) array.push(sort);
  if (skip) array.push(skip);
  if (limit) array.push(limit);

  let result = await Course.aggregate(array).exec();
  logger.debug(`fetched card raw ` + JSON.stringify(result));

  // Normalize questions for Locale and remove extra Qs fields
  // TODO: see suggestion above to pull Locale-only Qs data from the DB
  let question;
  for (let card of result) {
    let allQuestions = [];
    for (let question of card.questionsList) {
      allQuestions.push(Question.normalizeQuestionData(question, viewerLocale));
    }
    // pick a random question to show
    card.question =
      allQuestions[Math.floor(Math.random() * allQuestions.length)];

    card.questions = allQuestions;
  }

  logger.debug(`result with qs ` + JSON.stringify(result));
  return result;
};

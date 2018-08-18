import { basicFind } from '../../db-handlers/basic-query-handler';
import Course from '../../db-models/course-model';
import * as projectionWriter from '../../utils/projection-writer';
import * as util from 'util';
import Question from '../../db-models/question-model';

export const fetchCardEntry = async (fetchParameters, viewer) => {
  console.log(`in fetchCardEntry`);
  let arrayQuestion = [];
  let elemQuestion = { $match: { _id: fetchParameters.questionId } };
  arrayQuestion.push(elemQuestion);
  elemQuestion = {
    $project: {
      'doc_ref.EmbeddedDocRef.embedded_doc_refs': 1
    }
  };
  arrayQuestion.push(elemQuestion);
  elemQuestion = { $unwind: '$doc_ref.EmbeddedDocRef.embedded_doc_refs' };
  arrayQuestion.push(elemQuestion);
  elemQuestion = {
    $match: { 'doc_ref.EmbeddedDocRef.embedded_doc_refs.level': 'card' }
  };
  arrayQuestion.push(elemQuestion);
  elemQuestion = {
    $project: {
      'doc_ref.EmbeddedDocRef.embedded_doc_refs.doc_id': 1
    }
  };
  arrayQuestion.push(elemQuestion);
  let resultQuestion = await Question.aggregate(arrayQuestion).exec();
  let card_id =
    resultQuestion[0].doc_ref.EmbeddedDocRef.embedded_doc_refs.doc_id;
  arrayQuestion = [];
  elemQuestion = {};
  //SECTION ID
  elemQuestion = { $match: { _id: fetchParameters.questionId } };
  arrayQuestion.push(elemQuestion);
  elemQuestion = {
    $project: {
      'doc_ref.EmbeddedDocRef.embedded_doc_refs': 1
    }
  };
  arrayQuestion.push(elemQuestion);
  elemQuestion = { $unwind: '$doc_ref.EmbeddedDocRef.embedded_doc_refs' };
  arrayQuestion.push(elemQuestion);
  elemQuestion = {
    $match: { 'doc_ref.EmbeddedDocRef.embedded_doc_refs.level': 'section' }
  };
  arrayQuestion.push(elemQuestion);
  elemQuestion = {
    $project: {
      'doc_ref.EmbeddedDocRef.embedded_doc_refs.doc_id': 1
    }
  };
  arrayQuestion.push(elemQuestion);
  resultQuestion = await Question.aggregate(arrayQuestion).exec();
  let section_id =
    resultQuestion[0].doc_ref.EmbeddedDocRef.embedded_doc_refs.doc_id;
  /////
  let array = [];
  let elem;
  let viewerLocale = viewer.locale;
  elem = { $match: { _id: fetchParameters.courseId } };
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
          cond: { $eq: ['$$this._id', fetchParameters.unitId] }
        }
      }
    }
  };
  array.push(elem);

  elem = { $unwind: '$Units' };
  array.push(elem);

  elem = {
    $addFields: { 'Units.sections.Sections.cards.currentUnitId': '$Units._id' }
  };
  array.push(elem);

  elem = { $replaceRoot: { newRoot: '$Units.sections' } };
  array.push(elem);

  elem = {
    $project: {
      Sections: {
        $filter: {
          input: '$Sections',
          cond: { $eq: ['$$this._id', section_id] }
        }
      }
    }
  };
  array.push(elem);

  elem = { $unwind: '$Sections' };
  array.push(elem);

  elem = { $addFields: { 'Sections.cards.currentSectionId': '$Sections._id' } };
  array.push(elem);

  elem = { $replaceRoot: { newRoot: '$Sections.cards' } };
  array.push(elem);

  elem = { $unwind: '$Cards' };
  array.push(elem);
  elem = { $match: { 'Cards._id': card_id } };
  array.push(elem);
  elem = {
    $project: {
      'title.intlString': projectionWriter.writeIntlStringFilter(
        'Cards.title',
        viewerLocale
      ),
      'headline.intlString': projectionWriter.writeIntlStringFilter(
        'Cards.headline',
        viewerLocale
      ),
      _id: '$Cards._id',
      index: '$Cards.index',
      content_id: '$Cards.content_id',
      tags: '$Cards.tags',
      question_ids: '$Cards.question_ids',
      currentCourseId: 1,
      currentUnitId: 1,
      currentSectionId: 1
    }
  };
  array.push(elem);

  elem = {
    $project: {
      title: projectionWriter.writeIntlStringEval('title', viewerLocale),
      headline: projectionWriter.writeIntlStringEval('headline', viewerLocale),
      _id: 1,
      index: 1,
      content_id: 1,
      tags: 1,
      question_ids: 1,
      currentCourseId: 1,
      currentUnitId: 1,
      currentSectionId: 1
    }
  };
  array.push(elem);
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
  // get latest content version if not asked
  array.push({
    $project: {
      title: 1,
      headline: 1,
      _id: 1,
      index: 1,
      tags: 1,
      question_ids: 1,
      currentCourseId: 1,
      currentUnitId: 1,
      currentSectionId: 1,
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
      title: 1,
      headline: 1,
      _id: 1,
      index: 1,
      tags: 1,
      question_ids: 1,
      currentCourseId: 1,
      currentUnitId: 1,
      currentSectionId: 1,
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
      title: 1,
      headline: 1,
      _id: 1,
      index: 1,
      tags: 1,
      question_ids: 1,
      currentCourseId: 1,
      currentUnitId: 1,
      currentSectionId: 1,
      'content._id': 1,
      'content.version': 1,
      'content.content': projectionWriter.writeIntlStringEval(
        'content.content',
        viewerLocale
      )
    }
  });
  return Course.aggregate(array).exec();
};

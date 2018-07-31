import * as CourseFetch from '../../db-handlers/course/course-fetch';
import * as QuestionFetch from '../../db-handlers/question-fetch';
import * as VersionedContent from '../../db-handlers/versioned-content/versioned-content-fetch';
import { updateIntlStringObject } from '../../parsers/intl-string-parser';

export const editCard = async (
  localCourseId,
  localUnitId,
  localSectionId,
  localCardId,
  data,
  viewer
) => {
  const course = await CourseFetch.findById(localCourseId);
  if (!course) {
    return Promise.reject(Error('Course is not found'));
  }

  const unit = course.units.Units.find(it => it._id == localUnitId);
  if (!unit) {
    return Promise.reject(Error('CourseUnit is not found'));
  }

  const section = unit.sections.Sections.find(it => it._id == localSectionId);
  if (!section) {
    return Promise.reject(Error('UnitSection is not found'));
  }

  const card = section.cards.Cards.find(it => it._id == localCardId);
  if (!card) {
    return Promise.reject(Error('SectionCard is not found'));
  }

  const editLocale = data.locale || viewer.locale;

  /// Update card data ///
  // TODO: TypeError: data.hasOwnProperty is not a function!!!
  if ('index' in data) {
    card.index = data.index;
  }
  if ('tags' in data) {
    card.tags = data.tags;
  }
  if ('title' in data) {
    card.title = updateIntlStringObject(card.title, editLocale, data.title);
  }
  if ('headline' in data) {
    card.headline = updateIntlStringObject(
      card.headline,
      editLocale,
      data.headline
    );
  }
  await course.save();

  /// Update card content ///
  if ('content' in data) {
    let cardContent = await VersionedContent.findById(card.content_id);
    if (!cardContent) {
      return Promise.reject(Error('Card content is not found'));
    }
    try {
      await cardContent.updateContent(data.content, data.locale || 'en');
    } catch (error) {
      return Promise.reject(error);
    }
    card.content = {
      id: cardContent._id,
      version: cardContent.latest_version,
      content: data.content
    };
  }

  /// Update questions data ///
  if (data.questions && data.questions.length > 0) {
    let questions = [];
    for (let questionData of data.questions) {
      const question = await QuestionFetch.findById(questionData.id);
      if (!question) {
        continue;
      }
      await question.updateInfo(questionData, editLocale);
      questions.push(question);
    }
    card.questions = questions;
  }

  return Promise.resolve({ card });
};

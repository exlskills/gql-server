import { fromGlobalId } from 'graphql-relay';
import * as SectionCardFetch from '../db-handlers/course/section-card-fetch';
import { logger } from '../utils/logger';
import {
  attachEmptyFrame,
  connectionFromDataSource
} from '../paging-processor/connection-from-datasource';

export const resolveCardByQuestion = async (obj, args, viewer, info) => {
  logger.debug(`in resolveCardByQuestion`);
  const questionId = fromGlobalId(args.question_id).id;
  return await SectionCardFetch.fetchCardByQuestionId(
    questionId,
    viewer.locale
  );
};

export const resolveSectionCards = (obj, args, viewer, info) => {
  logger.debug(`in resolveSectionCards`);

  if (!args || !args.resolverArgs) {
    return attachEmptyFrame();
  }

  const courseParam = args.resolverArgs.find(e => e.param === 'course_id');
  const unitParam = args.resolverArgs.find(e => e.param === 'unit_id');
  const sectionParam = args.resolverArgs.find(e => e.param === 'section_id');

  if (!courseParam || !unitParam || !sectionParam) {
    return attachEmptyFrame();
  }

  let fetchParameters = {
    userId: viewer.user_id,
    courseId: fromGlobalId(courseParam.value).id,
    unitId: fromGlobalId(unitParam.value).id,
    sectionId: fromGlobalId(sectionParam.value).id
  };

  const cardParam = args.resolverArgs.find(e => e.param === 'card_id');
  if (cardParam) {
    fetchParameters.cardId = fromGlobalId(cardParam.value).id;
  }

  const versionParam = args.resolverArgs.find(e => e.param === 'version');
  if (versionParam) {
    fetchParameters.version = versionParam.value;
  }

  const execDetails = {
    queryFunction: SectionCardFetch.fetchSectionCards,
    businessKey: '_id',
    fetchParameters: fetchParameters
  };

  return connectionFromDataSource(execDetails, obj, args, viewer, info);
};

export const resolveCardEntry = async (obj, args, viewer, info) => {
  const businessKey = '_id';
  let fetchParameters = {};
  if (obj) {
    fetchParameters.courseId = obj.currentCourseId;
    fetchParameters.unitId = obj.currentUnitId;
    fetchParameters.sectionId = obj.currentSectionId;
    fetchParameters.cardId = obj._id;
  } else {
    if (args.course_id && args.unit_id && args.section_id && args.card_id) {
      fetchParameters.courseId = fromGlobalId(args.course_id).id;
      fetchParameters.unitId = fromGlobalId(args.unit_id).id;
      fetchParameters.sectionId = fromGlobalId(args.section_id).id;
      fetchParameters.cardId = fromGlobalId(args.card_id).id;
    } else {
      return Promise.reject('invalid args');
    }
  }

  if (args.resolverArgs) {
    const scrolling = args.resolverArgs.find(e => e.param === 'scroll');
    if (scrolling) {
      var scrollingDir = 1;
      if (scrolling.value === 'prev') {
        scrollingDir = -1;
      }
      fetchParameters = await SectionCardFetch.scrollToCard(
        scrollingDir,
        fetchParameters
      );
    }
  }

  // filterValues, aggregateArray, viewerLocale, fetchParameters
  const aggregateArray = [
    {
      $limit: 1
    }
  ];
  const result = await SectionCardFetch.fetchSectionCards(
    {},
    aggregateArray,
    viewer.locale,
    fetchParameters
  );
  return result && result.length === 1 ? result[0] : {};
};

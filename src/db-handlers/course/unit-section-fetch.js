import Course from '../../db-models/course-model';
import * as projectionWriter from '../../utils/projection-writer';
import { logger } from '../../utils/logger';

export const fetchUnitSections = async (
  filterValues,
  aggregateArray,
  viewerLocale,
  fetchParameters
) => {
  logger.debug(`in fetchUnitSections`);
  logger.debug(`   aggregateArray ` + JSON.stringify(aggregateArray));
  logger.debug(`   fetchParameters ` + JSON.stringify(fetchParameters));
  // let sort = aggregateArray.find(item => !!item.$sort);
  let sort = { $sort: { index: 1 } };
  let skip = aggregateArray.find(item => !!item.$skip);
  let limit = aggregateArray.find(item => !!item.$limit);

  let array = [];
  let elem;

  elem = { $match: { _id: fetchParameters.courseId } };
  array.push(elem);

  elem = { $addFields: { 'units.Units.sections.currentCourseId': '$_id' } };
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
      },
      'sections.currentCourseId': 1
    }
  };
  array.push(elem);

  elem = { $unwind: '$Units' };
  array.push(elem);

  elem = { $addFields: { 'Units.sections.currentUnitId': '$Units._id' } };
  array.push(elem);
  elem = { $addFields: { 'Units.sections.currentUnitIndex': '$Units.index' } };
  array.push(elem);

  elem = { $replaceRoot: { newRoot: '$Units.sections' } };
  array.push(elem);

  elem = { $unwind: '$Sections' };
  array.push(elem);
  if (fetchParameters.sectionId) {
    elem = { $match: { 'Sections._id': fetchParameters.sectionId } };
    array.push(elem);
  }
  elem = {
    $project: {
      'title.intlString': projectionWriter.writeIntlStringFilter(
        'Sections.title',
        viewerLocale
      ),
      'headline.intlString': projectionWriter.writeIntlStringFilter(
        'Sections.headline',
        viewerLocale
      ),
      cards_list: '$Sections.cards.Cards._id',
      _id: '$Sections._id',
      index: '$Sections.index',
      currentCourseId: 1,
      currentUnitId: 1,
      currentUnitIndex: 1
    }
  };
  array.push(elem);

  elem = {
    $project: {
      title: projectionWriter.writeIntlStringEval('title', viewerLocale),
      headline: projectionWriter.writeIntlStringEval('headline', viewerLocale),
      cards_list: 1,
      _id: 1,
      index: 1,
      currentCourseId: 1,
      currentUnitId: 1,
      currentUnitIndex: 1
    }
  };
  array.push(elem);

  if (sort) array.push(sort);
  if (skip) array.push(skip);
  if (limit) array.push(limit);

  logger.debug(`   array for aggregation ` + JSON.stringify(array));

  const arrayRet = await Course.aggregate(array).exec();
  logger.debug(`   arrayRet ` + JSON.stringify(arrayRet));
  return arrayRet;
};

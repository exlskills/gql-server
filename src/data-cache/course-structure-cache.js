import { logger } from '../utils/logger';
import { courseCache, courseStructureCache } from './cache-objects';
import { basicFind } from '../db-handlers/basic-query-handler';
import Course from '../db-models/course-model';
import { sizeof } from '../utils/calc-field-size';
import { getIntlStringFieldsOfObject } from './misc-cache';

export async function loadCourseStructureCache(init_load, courseID) {
  logger.debug(`In loadCourseStructureCache`);

  let objSize = 0;

  const unitFields = [
    'index',
    'final_exams',
    'final_exam_weight_pct',
    'attempts_allowed_per_day'
  ];

  const sectionFields = ['index'];

  const cardFields = [
    'index',
    'content_id',
    'question_ids',
    'course_item_ref',
    'github_edit_url',
    'tags',
    'updated_at'
  ];

  // Locale-specific fields
  const intlStringFields = ['title', 'headline', 'description'];

  const extractedAt = new Date();

  const selectVal = {
    units: 1
  };
  let runParams = null;
  let queryVal = null;
  if (init_load) {
    runParams = { isAll: true };
  } else if (courseID) {
    runParams = { isById: true };
    queryVal = courseID;
  } else {
    queryVal = {
      content_updated_at: { $gte: courseStructureCache.updated_at }
    };
  }

  let courseDbObj = await basicFind(
    Course,
    runParams,
    queryVal,
    { _id: 1 },
    selectVal
  );

  if (courseID && courseDbObj) {
    courseDbObj = [courseDbObj];
  }

  if (courseDbObj && courseDbObj.length > 0) {
    // logger.debug(`course records ` + JSON.stringify(courseDbObj));
    courseStructureCache.updated_at = extractedAt;
    logger.debug(
      `   CourseStructureCache updated_at ` + courseStructureCache.updated_at
    );

    for (let course of courseDbObj) {
      course = course.toObject();
      logger.debug(`Loading structure data for course ` + course._id);
      if (!courseCache[course._id] || !courseCache[course._id].locale_data) {
        // Note: loadCourseCache should complete first
        logger.debug(`Course is not in courseCache. Skipping `);
        continue;
      }

      if (!course.units) {
        // Note: loadCourseCache should complete first
        logger.error(`No Units in Course ` + course._id);
        continue;
      }

      // logger.debug(`course ` + JSON.stringify(course));
      const oneCourseDataCache = {};
      objSize += sizeof(course._id);

      let locales = [];
      for (let locale of Object.keys(courseCache[course._id].locale_data)) {
        // logger.debug(`Locale ` + locale);
        locales.push(locale);
      }

      oneCourseDataCache.units = {};
      objSize += sizeof('units');

      const unitsSorted = course.units.Units.sort(
        (it1, it2) => (it1.index || 0) - (it2.index || 0)
      );
      for (let unit of unitsSorted) {
        //logger.debug(`Unit ` + unit._id);

        oneCourseDataCache.units[unit._id] = {};
        objSize += sizeof(unit._id);

        const intlStringFieldsObj = getIntlStringFieldsOfObject(
          unit,
          intlStringFields,
          locales
        );

        objSize += intlStringFieldsObj.size;
        oneCourseDataCache.units[unit._id].locale_data =
          intlStringFieldsObj.data;

        for (let genField of unitFields) {
          // logger.debug(`genField ` + genField);
          if (unit[genField]) {
            objSize += sizeof(genField);
            oneCourseDataCache.units[unit._id][genField] = unit[genField];
            // logger.debug(`course[genField] ` + JSON.stringify(course[genField]));
            objSize += sizeof(unit[genField]);
          }
        }

        if (unit.sections) {
          // Sections
          oneCourseDataCache.units[unit._id].sections = {};
          objSize += sizeof('sections');

          const sectionsSorted = unit.sections.Sections.sort(
            (it1, it2) => (it1.index || 0) - (it2.index || 0)
          );
          for (let section of sectionsSorted) {
            //logger.debug(`Section ` + section._id);

            oneCourseDataCache.units[unit._id].sections[section._id] = {};
            objSize += sizeof(section._id);

            const intlStringFieldsObj = getIntlStringFieldsOfObject(
              section,
              intlStringFields,
              locales
            );

            objSize += intlStringFieldsObj.size;
            oneCourseDataCache.units[unit._id].sections[
              section._id
            ].locale_data = intlStringFieldsObj.data;

            for (let genField of sectionFields) {
              // logger.debug(`genField ` + genField);
              if (section[genField]) {
                objSize += sizeof(genField);
                oneCourseDataCache.units[unit._id].sections[section._id][
                  genField
                ] = section[genField];
                // logger.debug(`section[genField] ` + JSON.stringify(section[genField]));
                objSize += sizeof(section[genField]);
              }
            }

            if (section.cards) {
              // Cards
              oneCourseDataCache.units[unit._id].sections[
                section._id
              ].cards = {};
              objSize += sizeof('cards');

              const cardsSorted = section.cards.Cards.sort(
                (it1, it2) => (it1.index || 0) - (it2.index || 0)
              );
              for (let card of cardsSorted) {
                // logger.debug(`Card ` + card._id);

                oneCourseDataCache.units[unit._id].sections[section._id].cards[
                  card._id
                ] = {};
                objSize += sizeof(card._id);

                const intlStringFieldsObj = getIntlStringFieldsOfObject(
                  card,
                  intlStringFields,
                  locales
                );

                objSize += intlStringFieldsObj.size;
                oneCourseDataCache.units[unit._id].sections[section._id].cards[
                  card._id
                ].locale_data = intlStringFieldsObj.data;

                for (let genField of cardFields) {
                  // logger.debug(`genField ` + genField);
                  if (card[genField]) {
                    objSize += sizeof(genField);
                    oneCourseDataCache.units[unit._id].sections[
                      section._id
                    ].cards[card._id][genField] = card[genField];
                    //logger.debug(`card[genField] ` + JSON.stringify(card[genField]));
                    objSize += sizeof(card[genField]);
                  }
                }
              } // On Cards
            }
          } // On Sections
        }
      } // On Units

      courseStructureCache[course._id] = oneCourseDataCache;
    } // On courses

    logger.debug(
      `  loadCourseStructureCache RESULT ` +
        JSON.stringify(courseStructureCache)
    );
    logger.debug(`  loadCourseStructureCache RESULT Size ` + objSize);
  } else {
    logger.debug(`No course records extracted `);
  }
}

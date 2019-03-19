import { logger } from '../utils/logger';
import { courseCache, courseStructureCache } from './cache-objects';
import { basicFind } from '../db-handlers/basic-query-handler';
import Course from '../db-models/course-model';
import { sizeof } from '../utils/calc-field-size';
import { getIntlStringFieldsOfObject } from './misc-cache';
import { loadCardQuestionCache } from './question-cache';
import { loadCardContentCache } from './versioned-content-cache';

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

  let courseDbObj;
  try {
    courseDbObj = await basicFind(
      Course,
      runParams,
      queryVal,
      { _id: 1 },
      selectVal
    );
  } catch (errInternalAlreadyReported) {
    return;
  }

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
      const courseObj = {};
      objSize += sizeof(course._id);

      let locales = [];
      for (let locale of Object.keys(courseCache[course._id].locale_data)) {
        // logger.debug(`Locale ` + locale);
        locales.push(locale);
      }

      courseObj.units = new Map();
      objSize += sizeof('units');

      const unitsSorted = course.units.Units.sort(
        (it1, it2) => (it1.index || 0) - (it2.index || 0)
      );
      for (let unit of unitsSorted) {
        //logger.debug(`Unit ` + unit._id);

        const unitObj = {};

        const intlStringFieldsObj = getIntlStringFieldsOfObject(
          unit,
          intlStringFields,
          locales
        );

        objSize += intlStringFieldsObj.size;
        unitObj.locale_data = intlStringFieldsObj.data;

        for (let genField of unitFields) {
          // logger.debug(`genField ` + genField);
          if (unit[genField]) {
            objSize += sizeof(genField);
            unitObj[genField] = unit[genField];
            // logger.debug(`course[genField] ` + JSON.stringify(course[genField]));
            objSize += sizeof(unit[genField]);
          }
        }

        if (unit.sections) {
          // Sections
          unitObj.sections = new Map();
          objSize += sizeof('sections');

          const sectionsSorted = unit.sections.Sections.sort(
            (it1, it2) => (it1.index || 0) - (it2.index || 0)
          );
          for (let section of sectionsSorted) {
            //logger.debug(`Section ` + section._id);

            const sectionObj = {};

            const intlStringFieldsObj = getIntlStringFieldsOfObject(
              section,
              intlStringFields,
              locales
            );

            objSize += intlStringFieldsObj.size;
            sectionObj.locale_data = intlStringFieldsObj.data;

            for (let genField of sectionFields) {
              // logger.debug(`genField ` + genField);
              if (section[genField]) {
                objSize += sizeof(genField);
                sectionObj[genField] = section[genField];
                // logger.debug(`section[genField] ` + JSON.stringify(section[genField]));
                objSize += sizeof(section[genField]);
              }
            }

            if (section.cards) {
              // Cards
              sectionObj.cards = new Map();
              objSize += sizeof('cards');

              const cardsSorted = section.cards.Cards.sort(
                (it1, it2) => (it1.index || 0) - (it2.index || 0)
              );
              for (let card of cardsSorted) {
                // logger.debug(`Card ` + card._id);

                const cardObj = {};

                const intlStringFieldsObj = getIntlStringFieldsOfObject(
                  card,
                  intlStringFields,
                  locales
                );

                objSize += intlStringFieldsObj.size;
                cardObj.locale_data = intlStringFieldsObj.data;

                for (let genField of cardFields) {
                  // logger.debug(`genField ` + genField);
                  if (card[genField]) {
                    objSize += sizeof(genField);
                    cardObj[genField] = card[genField];
                    //logger.debug(`card[genField] ` + JSON.stringify(card[genField]));
                    objSize += sizeof(card[genField]);
                  }
                }
                /*
                logger.debug(
                  `  loadCourseStructureCache cardObj ` +
                    JSON.stringify(cardObj)
                );
                */
                sectionObj.cards.set(card._id, cardObj);
                objSize += sizeof(card._id);

                try {
                  const questObjSize = await loadCardQuestionCache(
                    card._id,
                    card.question_ids,
                    locales
                  );
                  objSize += questObjSize;
                } catch (err) {
                  logger.error(
                    `loading question cache for card id ` +
                      card._id +
                      ': ' +
                      err
                  );
                }
                try {
                  const contentObjSize = await loadCardContentCache(
                    card._id,
                    card.content_id,
                    locales
                  );
                  objSize += contentObjSize;
                } catch (err) {
                  logger.error(
                    `loading content cache for card id ` + card._id + ': ' + err
                  );
                }
              } // On Cards
            } // Has Cards

            unitObj.sections.set(section._id, sectionObj);
            /*
            logger.debug(
              `  loadCourseStructureCache sectionObj ` +
                JSON.stringify(sectionObj)
            );
            logger.debug(
              `  loadCourseStructureCache sectionObj Cards ` +
                sectionObj.cards.keys()
            );
            */
            objSize += sizeof(section._id);
          } // On Sections
        } // Has Sections

        courseObj.units.set(unit._id, unitObj);
        objSize += sizeof(unit._id);
      } // On Units

      courseStructureCache[course._id] = courseObj;
    } // On courses

    logger.debug(`  loadCourseStructureCache RESULT Size ` + objSize);
  } else {
    logger.debug(`No course records extracted `);
  }
}

export function isCardInCache(course_id, unit_id, section_id, card_id) {
  if (
    isSectionInCache(course_id, unit_id, section_id) &&
    courseStructureCache[course_id].units.get(unit_id).sections.get(section_id)
      .cards &&
    courseStructureCache[course_id].units
      .get(unit_id)
      .sections.get(section_id)
      .cards.get(card_id)
  ) {
    return true;
  }
  return false;
}

export function isSectionInCache(course_id, unit_id, section_id) {
  if (
    courseStructureCache[course_id] &&
    courseStructureCache[course_id].units &&
    courseStructureCache[course_id].units.get(unit_id) &&
    courseStructureCache[course_id].units.get(unit_id).sections &&
    courseStructureCache[course_id].units.get(unit_id).sections.get(section_id)
  ) {
    return true;
  }
  return false;
}

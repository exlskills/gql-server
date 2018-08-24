import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLNonNull,
  GraphQLString
} from 'graphql';

import {
  fromGlobalId,
  mutationWithClientMutationId,
  toGlobalId
} from 'graphql-relay';
import { id_gen } from '../../utils/url-id-generator';
import { fetchById } from '../../db-handlers/course/course-fetch';
import { fetchCourseUnitsBase } from '../../db-handlers/course/course-unit-fetch';
import { createActivity } from '../../db-handlers/activities-cud';
import { getStringByLocale } from '../../parsers/intl-string-parser';
import { toClientUrlId } from '../../utils/client-url';
import { logger } from '../../utils/logger';

export default mutationWithClientMutationId({
  name: 'TakeQuiz',
  inputFields: {
    card: { type: GraphQLBoolean },
    courseId: { type: new GraphQLNonNull(GraphQLID) },
    unitId: { type: new GraphQLNonNull(GraphQLID) },
    sectionId: { type: GraphQLID }
  },
  outputFields: {
    quiz_id: {
      type: GraphQLString,
      resolve: (obj, viewer, info) => toGlobalId(obj.type, id_gen())
    }
  },
  mutateAndGetPayload: async (
    { card, courseId, unitId, sectionId },
    viewer,
    info
  ) => {
    logger.debug(` in TakeQuiz mutateAndGetPayload`);
    const course_id = fromGlobalId(courseId).id;
    const unit_id = fromGlobalId(unitId).id;

    const course = await fetchById(course_id, {
      title: 1
    });
    const courseTitle = getStringByLocale(course.title, viewer.locale).text;
    const courseUrlId = toClientUrlId(courseTitle, course_id);
    const fetchParameters = {
      courseId: course_id,
      unitId: unit_id
    };
    const unit = await fetchCourseUnitsBase(
      null,
      null,
      viewer.locale,
      fetchParameters,
      false
    );
    const unitUrlId = toClientUrlId(unit[0].title, unit_id);

    let activity = {
      listDef_value: 'attempted_quiz',
      activity_link: `/courses/${courseUrlId}/units/${unitUrlId}`,
      doc_ref: {
        EmbeddedDocRef: {
          embedded_doc_refs: [
            {
              level: 'course',
              doc_id: course_id
            },
            {
              level: 'unit',
              doc_id: unit_id
            }
          ]
        }
      }
    };
    if (sectionId) {
      let section_id = fromGlobalId(sectionId).id;
      activity.doc_ref.EmbeddedDocRef.embedded_doc_refs.push({
        level: 'section',
        doc_id: section_id
      });
    }
    logger.debug(`  result activity ` + JSON.stringify(activity));
    createActivity(viewer.user_id, activity);
    return {};
  }
});

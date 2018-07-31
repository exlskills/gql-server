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
import * as CourseFetch from '../../db-handlers/course/course-fetch';
import { createActivity } from '../../db-handlers/activities-cud';
import { getStringByLocale } from '../../parsers/intl-string-parser';
import { toClientUrlId } from '../../utils/client-url';

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
    const localUnitId = fromGlobalId(unitId).id;
    const localCourseId = fromGlobalId(courseId).id;
    const course = await CourseFetch.findById(localCourseId);
    const courseTitle = getStringByLocale(course.title, viewer.locale).text;
    const courseUrlId = toClientUrlId(courseTitle, course._id);
    const unit = course.units.Units.find(
      item => item._id.toString() == localUnitId
    );
    const unitTitle = getStringByLocale(unit.title, viewer.locale).text;
    const unitUrlId = toClientUrlId(unitTitle, unit._id);

    let activity = {
      listDef_value: 'attempted_quiz',
      activity_link: `/courses/${courseUrlId}/units/${unitUrlId}`,
      doc_ref: {
        EmbeddedDocRef: {
          embedded_doc_refs: [
            {
              level: 'course',
              doc_id: localCourseId
            },
            {
              level: 'unit',
              doc_id: localUnitId
            }
          ]
        }
      }
    };
    if (sectionId) {
      let localSectionId = fromGlobalId(sectionId).id;
      activity.doc_ref.EmbeddedDocRef.embedded_doc_refs.push({
        level: 'section',
        doc_id: localSectionId
      });
    }
    createActivity(viewer.user_id, activity);
    return {};
  }
});

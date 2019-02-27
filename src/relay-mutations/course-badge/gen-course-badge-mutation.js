import { fromGlobalId, mutationWithClientMutationId } from 'graphql-relay';
import { GraphQLID, GraphQLNonNull } from 'graphql';
import { CompletionObjType } from '../../relay-models';
import { processGenCourseBadge } from '../../relay-mutate-and-get/course-badge-mag';
import { GraphQLString } from 'graphql/type/scalars';

export default mutationWithClientMutationId({
  name: 'GenerateCourseBadge',
  inputFields: {
    course_id: { type: new GraphQLNonNull(GraphQLID) },
    badge_type: { type: GraphQLString }
  },
  outputFields: {
    badge_uid: { type: GraphQLString },
    completionObj: {
      type: CompletionObjType
    }
  },
  mutateAndGetPayload: ({ course_id, badge_type }, viewer, info) => {
    const localCourseId = fromGlobalId(course_id).id;
    badge_type = badge_type ? badge_type : 'default';
    return processGenCourseBadge(localCourseId, viewer, badge_type, info).then(
      returnObj => returnObj
    );
  }
});

import { GraphQLID, GraphQLNonNull, GraphQLString } from 'graphql';
import { fromGlobalId, mutationWithClientMutationId } from 'graphql-relay';
import { CompletionObjType } from '../../relay-models/completion-obj-type';
import { logger } from '../../utils/logger';
import { processCardInteraction } from '../../relay-mutate-and-get/card-interaction-mag';

export default mutationWithClientMutationId({
  name: 'SetCardInteraction',
  inputFields: {
    course_id: { type: new GraphQLNonNull(GraphQLID) },
    unit_id: { type: new GraphQLNonNull(GraphQLID) },
    section_id: { type: GraphQLID },
    card_id: { type: new GraphQLNonNull(GraphQLID) },
    interaction: { type: GraphQLString }
  },
  outputFields: {
    completionObj: {
      type: CompletionObjType
    }
  },
  mutateAndGetPayload: (
    { course_id, unit_id, section_id, card_id, interaction },
    viewer,
    info
  ) => {
    logger.debug(`in relay-mutation SetCardInteraction mutateAndGetPayload`);
    const localCourseId = fromGlobalId(course_id).id;
    const localUnitId = fromGlobalId(unit_id).id;
    const localSectionId = fromGlobalId(section_id).id;
    const localCardId = fromGlobalId(card_id).id;
    return processCardInteraction(
      localCourseId,
      localUnitId,
      localSectionId,
      localCardId,
      interaction,
      viewer
    ).then(returnObj => returnObj);
  }
});

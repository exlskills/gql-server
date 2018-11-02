import { logger } from '../utils/logger';
import { fetchOneCourseRecord } from '../db-handlers/course/course-fetch';
import { fetchByUserIdAndCardId } from '../db-handlers/card-interaction-fetch';
import { fetchCourseItemRefByCourseUnitCardId } from '../db-handlers/course/section-card-fetch';
import CardInteraction from '../db-models/card-interaction-model';
import { updateLastAccessedAt } from '../db-handlers/user/user-course-role-cud';

export const processCardInteractionWrapper = (
  course_id,
  unit_id,
  section_id,
  card_id,
  interaction,
  viewer
) => {
  // Launching but not waiting
  processCardInteraction(
    course_id,
    unit_id,
    section_id,
    card_id,
    interaction,
    viewer
  );
  return {
    completionObj: {
      code: '0',
      msg: 'Action received',
      msg_id: 'action_received'
    }
  };
};

const processCardInteraction = async (
  course_id,
  unit_id,
  section_id,
  card_id,
  interaction,
  viewer
) => {
  logger.debug(`in processCardInteraction`);
  logger.debug(`   card_id ` + card_id);
  logger.debug(`   interaction ` + interaction);

  const received_at = new Date();

  try {
    let cardInter = await fetchByUserIdAndCardId(viewer.user_id, card_id);

    if (!cardInter) {
      if (!(course_id && unit_id)) {
        logger.error(`In processCardInteraction course/unit IDs not provided`);
        return {
          completionObj: {
            code: '1',
            msg: 'Course and Unit IDs missing',
            msg_id: 'course_unit_ids_missing'
          }
        };
      }

      let cardRec;
      if (!section_id) {
        cardRec = await fetchCourseItemRefByCourseUnitCardId(
          course_id,
          unit_id,
          card_id
        );
        logger.debug(`  cardRec for section_id ` + JSON.stringify(cardRec));

        if (!cardRec) {
          logger.error(
            `Card not found by Course, Unit and Card ID: ` + card_id
          );
          return {
            completionObj: {
              code: '1',
              msg: 'Card not found',
              msg_id: 'card_not_found'
            }
          };
        }

        section_id =
          cardRec.course_item_ref && cardRec.course_item_ref.section_id
            ? cardRec.course_item_ref.section_id
            : '';
        logger(` section_id ` + section_id);
      } else {
        cardRec = await fetchOneCourseRecord(
          {
            _id: course_id,
            'units.Units._id': unit_id,
            'units.Units.sections.Sections._id': section_id,
            'units.Units.sections.Sections.cards.Cards._id': card_id
          },
          { _id: 1 }
        );
        logger.debug(`  cardRec ` + JSON.stringify(cardRec));

        if (!cardRec) {
          logger.error(`Card not found: ` + card_id);
          return {
            completionObj: {
              code: '1',
              msg: 'Card not found',
              msg_id: 'card_not_found'
            }
          };
        }
      }

      try {
        await CardInteraction.create({
          user_id: viewer.user_id,
          card_id: card_id,
          action: {
            action: interaction,
            recorded_at: received_at
          },
          course_item_ref: {
            course_id: course_id,
            unit_id: unit_id,
            section_id: section_id
          }
        });
      } catch (err) {
        logger.error(`Card Interaction insert failed ` + err);
        return {
          completionObj: {
            code: '1',
            msg: 'Card Interaction insert failed',
            msg_id: 'card_interaction_insert_failed'
          }
        };
      }
    } else {
      // Get courseId for the Last Accessed update
      course_id = cardInter.course_item_ref.course_id;

      // Override latest action
      cardInter.action = {
        action: interaction,
        recorded_at: received_at
      };
      try {
        await cardInter.save();
      } catch (err) {
        logger.error(`in card_action cardInter.save ` + err);
        return {
          completionObj: {
            code: '1',
            msg: 'Card Interaction update failed',
            msg_id: 'card_interaction_update_failed'
          }
        };
      }
    }

    try {
      await updateLastAccessedAt(viewer.user_id, course_id, received_at);
    } catch (alreadyReported) {
      return {
        completionObj: {
          code: '1',
          msg: 'User Course Role update failed',
          msg_id: 'user_course_role_update_failed'
        }
      };
    }
    logger.debug(`processCardInteraction completed Ok `);
    return {
      completionObj: {
        code: '0',
        msg: '',
        msg_id: ''
      }
    };
  } catch (error) {
    logger.error(`In processCardInteraction ` + error);
    return {
      completionObj: {
        code: '1',
        msg: 'Processing failed',
        msg_id: 'process_failed'
      }
    };
  }
};

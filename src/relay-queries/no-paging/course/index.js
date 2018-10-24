import getCourseById from './course-get-query';
import getCourseDeliverySchedule from './course-delivery-schedule-get-query';
import { getCard, getCardByQuestion } from './card-get-query';

import topicFilter from './topic-get-query';
import courseUnit from './course-unit-get-query';

export default {
  getCourseById,
  getCourseDeliverySchedule,
  getCard,
  getCardByQuestion,
  topicFilter,
  courseUnit
};

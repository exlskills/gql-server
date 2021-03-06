import {
  listCourses,
  listUnits,
  listSections,
  listCards,
  userCourseUnitExamStatusPaging,
  listTextMatchingCourseItems
} from './course-list-query';
import { questionPaging, questionPagingExam } from './question-list-query';
import { listActivities } from './activity-list-query';
import { notificationPaging } from './notification-list-query';
import { listInstructors } from './user-list-query';
import { listDigitalDiplomas } from './digital-diploma-list-query';

export default {
  listActivities,
  listCards,
  listCourses,
  listInstructors,
  notificationPaging,
  questionPaging,
  questionPagingExam,
  listSections,
  listUnits,
  userCourseUnitExamStatusPaging,
  listDigitalDiplomas,
  listTextMatchingCourseItems
};

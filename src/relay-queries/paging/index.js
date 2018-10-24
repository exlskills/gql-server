import {
  listCourses,
  listUnits,
  listSections,
  listCards,
  userCourseUnitExamStatusPaging
} from './course-list-query';
import { questionPaging, questionPagingExam } from './question-list-query';
import { listActivities } from './activity-list-query';
import { notificationPaging } from './notification-list-query';
import { listInstructors } from './user-list-query';

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
  userCourseUnitExamStatusPaging
};

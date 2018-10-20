import { NodeField } from '../relay-models';

import queryUsers from './no-paging/user';
import queryExam from './no-paging/exams';
import pagingQueries from './paging';
import courseQueries from './no-paging/course';
import questionQueries from './no-paging/question';
import langQueries from './no-paging/lang';
import examAttempt from './no-paging/exam-attempt';

export default {
  node: NodeField,
  // Individual
  courseById: courseQueries.courseById,
  courseUnit: courseQueries.courseUnit,
  courseDeliverySchedule: courseQueries.courseDeliveryScheduleByMethod,
  cardEntry: courseQueries.sectionCardEntry,
  cardByQuestion: courseQueries.cardByQuestion,
  userActivity: queryUsers.userActivity,
  userProfile: queryUsers.userProfile,
  examToTake: queryExam.examToTake,
  examAttempt: examAttempt.examAttempt,
  // Paging
  activityPaging: pagingQueries.activityPaging,
  cardPaging: pagingQueries.cardPaging,
  coursePaging: pagingQueries.coursePaging,
  langType: langQueries.langType,
  listInstructors: pagingQueries.listInstructors,
  notificationPaging: pagingQueries.notificationPaging,
  questionHint: questionQueries.questionHint,
  questionPaging: pagingQueries.questionPaging,
  questionPagingExam: pagingQueries.questionPagingExam,
  sectionPaging: pagingQueries.sectionPaging,
  topicFilter: courseQueries.topicFilter,
  unitPaging: pagingQueries.unitPaging,
  userCourseUnitExamStatusPaging: pagingQueries.userCourseUnitExamStatusPaging
};

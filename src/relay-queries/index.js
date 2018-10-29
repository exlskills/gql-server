import { NodeField } from '../relay-models';

import queryUsers from './no-paging/user';
import queryExam from './no-paging/exams';
import pagingQueries from './paging';
import courseQueries from './no-paging/course';
import digitalDiplomaQueries from './no-paging/digital-diploma';
import questionQueries from './no-paging/question';
import langQueries from './no-paging/lang';
import examSession from './no-paging/exam-session';

export default {
  node: NodeField,

  // Individual

  getDigitalDiplomaById: digitalDiplomaQueries.getDigitalDiplomaById,

  // TODO remove dup after spf update
  getCourseById: courseQueries.getCourseById,
  courseById: courseQueries.getCourseById,

  courseUnit: courseQueries.courseUnit,

  // TODO remove dup after spf update
  getCourseDeliverySchedule: courseQueries.getCourseDeliverySchedule,
  courseDeliverySchedule: courseQueries.getCourseDeliverySchedule,

  // TODO remove dup after spf update
  cardEntry: courseQueries.getCard,
  getCard: courseQueries.getCard,
  getCardByQuestion: courseQueries.getCardByQuestion,

  topicFilter: courseQueries.topicFilter,

  getUserActivityCountByDate: queryUsers.getUserActivityCountByDate,

  // TODO remove dup after spf update
  getUserProfile: queryUsers.getUserProfile,
  userProfile: queryUsers.getUserProfile,

  examToTake: queryExam.examToTake,

  examSession: examSession.examAttempt,

  // Paging
  listActivities: pagingQueries.listActivities,
  listCards: pagingQueries.listCards,

  // TODO remove dup after spf update
  coursePaging: pagingQueries.listCourses,
  listCourses: pagingQueries.listCourses,

  langType: langQueries.langType,
  listInstructors: pagingQueries.listInstructors,
  notificationPaging: pagingQueries.notificationPaging,

  // TODO remove dup after spf update
  getQuestionHint: questionQueries.getQuestionHint,
  questionHint: questionQueries.getQuestionHint,

  //questionPaging: pagingQueries.questionPaging,
  //questionPagingExam: pagingQueries.questionPagingExam,

  listSections: pagingQueries.listSections,

  // TODO remove dup after spf update
  unitPaging: pagingQueries.listUnits,
  listUnits: pagingQueries.listUnits,

  listDigitalDiplomas: pagingQueries.listDigitalDiplomas,

  userCourseUnitExamStatusPaging: pagingQueries.userCourseUnitExamStatusPaging
};

import { NodeField } from '../relay-models';

import queryUsers from './no-paging/user';
import queryExam from './no-paging/exams';
import queryVersionedContents from './no-paging/versioned-content';
import pagingQueries from './paging';
import courseQueries from './no-paging/course';
import questionQueries from './no-paging/question';
import langQueries from './no-paging/lang';
import examAttempt from './no-paging/exam-attempt';

export default {
  node: NodeField,
  courseById: courseQueries.courseById,
  cardEntry: courseQueries.sectionCardEntry,
  cardByQuestion: courseQueries.cardByQuestion,
  userActivity: queryUsers.userActivity,
  userProfile: queryUsers.userProfile,
  examToTake: queryExam.examToTake,
  examAttempt: examAttempt.examAttempt,
  courseUnit: courseQueries.courseUnit,
  oneVersionedContent: queryVersionedContents.oneVersionedContent,
  activityPaging: pagingQueries.activityPaging,
  coursePaging: pagingQueries.coursePaging,
  unitPaging: pagingQueries.unitPaging,
  userCourseUnitExamStatusPaging: pagingQueries.userCourseUnitExamStatusPaging,
  sectionPaging: pagingQueries.sectionPaging,
  cardPaging: pagingQueries.cardPaging,
  notificationPaging: pagingQueries.notificationPaging,
  questionHint: questionQueries.questionHint,
  langType: langQueries.langType,
  questionPaging: pagingQueries.questionPaging,
  questionPagingExam: pagingQueries.questionPagingExam,
  topicFilter: courseQueries.topicFilter
};

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
  courseUnitSummary: courseQueries.courseUnitSummary,
  cardEntry: courseQueries.sectionCardEntry,
  cardByQuestion: courseQueries.cardByQuestion,
  userProfile: queryUsers.profile,
  userActivity: queryUsers.userActivity,
  profileSpecific: queryUsers.profileSpecific,
  userActivityById: queryUsers.userActivityById,
  oneExam: queryExam.oneExam,
  specificExamAttempt: examAttempt.specificExamAttempt,
  unitSpec: courseQueries.unitSpec,
  oneVersionedContent: queryVersionedContents.oneVersionedContent,
  activityPaging: pagingQueries.activityPaging,
  coursePaging: pagingQueries.coursePaging,
  unitPaging: pagingQueries.unitPaging,
  unitStatusPaging: pagingQueries.unitStatusPaging,
  sectionPaging: pagingQueries.sectionPaging,
  cardPaging: pagingQueries.cardPaging,
  notificationPaging: pagingQueries.notificationPaging,
  questionEntry: questionQueries.questionEntry,
  langType: langQueries.langType,
  questionPaging: pagingQueries.questionPaging,
  questionPagingExam: pagingQueries.questionPagingExam,
  topicFilter: courseQueries.topicFilter
};

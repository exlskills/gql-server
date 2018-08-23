import { NodeField } from '../relay-models';

import queryUsers from './no-paging/user';
import queryExam from './no-paging/exams';
import queryVersionedContents from './no-paging/versioned-content';
import pagingQueries from './paging';
import courseQueries from './no-paging/course';
import questionQueries from './no-paging/question';
import langQueries from './no-paging/lang';
import examAttempt from './no-paging/exam-attempt';

// TODO on wc:
// (1) rename unit_processing to unit_progress_state
// (2) delete quiz_lvl
// (3a) app/pages/Course/components/grades/index.tsx: add inside const rootQuery = graphql`, `gradesList: unitStatusPaging`
// sections_list {
//             id
//             cards_list {
//               id
//               ema
//             }
//           }
// (3b) app/pages/Course/components/grades/index.tsx: remove from const rootQuery = graphql`
//

export default {
  node: NodeField,
  courseById: courseQueries.courseById,
  // TODO: in wc, ensure courseUnitSummary is not used (courseUserExamAttempts)
  // courseUnitSummary: courseQueries.courseUserExamAttempts,
  cardEntry: courseQueries.sectionCardEntry,
  cardByQuestion: courseQueries.cardByQuestion,
  userActivity: queryUsers.userActivity,
  // TODO: in wc, change profileSpecific to userProfile
  profileSpecific: queryUsers.userProfile,
  userProfile: queryUsers.userProfile,
  // TODO: in wc, change userActivityById to userActivity
  userActivityById: queryUsers.userActivityById,
  // TODO: in wc, rename oneExam to examToTake
  oneExam: queryExam.examToTake,
  specificExamAttempt: examAttempt.specificExamAttempt,
  // TODO: in wc, rename unitSpec to courseUnit
  unitSpec: courseQueries.courseUnit,
  oneVersionedContent: queryVersionedContents.oneVersionedContent,
  activityPaging: pagingQueries.activityPaging,
  coursePaging: pagingQueries.coursePaging,
  unitPaging: pagingQueries.unitPaging,
  // TODO: in wc, rename unitStatusPaging to userCourseUnitExamStatusPaging
  unitStatusPaging: pagingQueries.userCourseUnitExamStatusPaging,
  sectionPaging: pagingQueries.sectionPaging,
  cardPaging: pagingQueries.cardPaging,
  notificationPaging: pagingQueries.notificationPaging,
  // TODO: in wc, rename questionEntry to questionHint
  questionEntry: questionQueries.questionHint,
  langType: langQueries.langType,
  questionPaging: pagingQueries.questionPaging,
  questionPagingExam: pagingQueries.questionPagingExam,
  topicFilter: courseQueries.topicFilter
};

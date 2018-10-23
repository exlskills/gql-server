import notification from './notification';
import examSession from './exam-session';
import userMutations from './user';
import userCourseRoleMutations from './user-course-role';
import question from './question';

export default {
  readNotification: notification.readNotification,

  startExam: examSession.startExam,
  submitExam: examSession.submitExam,

  // TODO remove after SPF update
  submitAnswer: question.setCardQuestionAnswer,

  getCurrentExamQuestionAnswer: question.getCurrentExamQuestionAnswer,
  setCardQuestionAnswer: question.setCardQuestionAnswer,
  setExamQuestionAnswer: question.setExamQuestionAnswer,

  updateUserProfile: userMutations.updateUserProfile,
  updateUserUnitStatus: userMutations.updateUserUnitStatus,
  updateUserCourseRole: userCourseRoleMutations.updateUserCourseRole
};

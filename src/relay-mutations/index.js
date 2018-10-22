import notification from './notification';
import examSession from './exam-session';
import userMutations from './user';
import userCourseRoleMutations from './user-course-role';
import question from './question';
import quizAttempt from './quiz';

export default {
  readNotification: notification.readNotification,
  leaveExam: examSession.leaveExam,
  startExam: examSession.startExam,
  submitAnswer: question.submitCardQuestionAnswer,
  submitExamQuestionAnswer: question.submitExamQuestionAnswer,
  takeExam: examSession.takeExam,
  updateUserProfile: userMutations.updateUserProfile,
  updateUserUnitStatus: userMutations.updateUserUnitStatus,
  updateUserCourseRole: userCourseRoleMutations.updateUserCourseRole,
  takeQuiz: quizAttempt.takeQuiz
};

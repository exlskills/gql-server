import notification from './notification';
import examAttempt from './exam-attempt';
import userMutations from './user';
import userCourseRoleMutations from './user-course-role';
import examMutations from './exam';
import quizAttempt from './quiz';

export default {
  readNotification: notification.readNotification,
  submitAnswer: examMutations.submitAnswer,
  takeExam: examAttempt.takeExam,
  startExam: examMutations.startExam,
  leaveExam: examAttempt.leaveExam,
  updateUserProfile: userMutations.updateUserProfile,
  updateUserUnitStatus: userMutations.updateUserUnitStatus,
  updateUserCourseRole: userCourseRoleMutations.updateUserCourseRole,
  takeQuiz: quizAttempt.takeQuiz
};

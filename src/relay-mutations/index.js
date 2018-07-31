import notification from './notification';
import examAttempt from './exam-attempt';
import userMutations from './user';
import userCourseRoleMutations from './user-course-role';
import addExamAttemptMutation from './exam';
import quizAttempt from './quiz';

export default {
  readNotification: notification.readNotification,
  submitAnswer: addExamAttemptMutation.submitAnswer,
  takeExam: examAttempt.takeExam,
  leaveExam: examAttempt.leaveExam,
  updateUserProfile: userMutations.updateUserProfile,
  updateUserUnitStatus: userMutations.updateUserUnitStatus,
  updateUserCourseRole: userCourseRoleMutations.updateUserCourseRole,
  takeQuiz: quizAttempt.takeQuiz
};

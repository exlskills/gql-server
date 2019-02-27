import { logger } from '../utils/logger';

export const loadCourseData = async courseID => {
  const fetchParameters = {};
  if (courseID) {
    fetchParameters.courseIds = [courseID];
  }
};

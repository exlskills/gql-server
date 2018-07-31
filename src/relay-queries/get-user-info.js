module.exports = {
  getCourseRoles: user => {
    if (user.course_roles) {
      return user.course_roles;
    }
    return [];
  },
  getAuthStrategies: user => {
    if (user.auth_strategies) {
      return user.auth_strategies;
    }
    return [];
  },
  getOrganizationRoles: user => {
    if (user.organization_roles) {
      return user.organization_roles;
    }
    return [];
  }
};

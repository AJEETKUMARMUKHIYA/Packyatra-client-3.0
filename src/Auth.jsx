import Settings from "./admin/Common/Setting";

const Auth = {
  isAuthenticated: false,
  isSiteUser: false,
  isAccountManager: false,
  isFSC: false,
  isHeadFinance: false,
  isAdmin: false,
  isClientFinance: false,
  init(user) {
    this.isSiteUser = user.roles.filter(
      (a) => a.roleName === Settings.ROLE_SITE_USER
    ).length > 0;

    this.isAccountManager = user.roles.filter(
      (a) => a.roleName === Settings.ROLE_ACCOUNT_MANAGER
    ).length > 0;

    this.isFSC = user.roles.filter((a) => a.roleName === Settings.ROLE_FSC)
      .length > 0;

    this.isHeadFinance = user.roles.filter(
      (a) => a.roleName === Settings.ROLE_HEAD_FINANCE
    ).length > 0;

    this.isAdmin = user.roles.filter((a) => a.roleName === Settings.ROLE_ADMIN)
      .length > 0;

    this.isClientFinance = user.roles.filter(
      (a) => a.roleName === Settings.ROLE_CLIENT_FINANCE
    ).length > 0;
  },
  authenticate(cb) {
    this.isAuthenticated = true;
    setTimeout(cb, 100); // fake async
  },
  signout(cb) {
    this.isAuthenticated = false;
    setTimeout(cb, 100); // fake async
  },
};

export default Auth;

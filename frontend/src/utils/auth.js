export const ADMIN_TOKEN_KEY = "beunicorn_admin_token";
export const ADMIN_USER_KEY = "beunicorn_admin_user";

export const MEMBER_TOKEN_KEY = "beunicorn_member_token";
export const MEMBER_USER_KEY = "beunicorn_member_user";

export const isAdminRole = (role) => {
  return ["admin", "cabin_admin"].includes(role);
};

export const saveAdminSession = (user, token) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
};

export const saveMemberSession = (user, token) => {
  localStorage.setItem(MEMBER_TOKEN_KEY, token);
  localStorage.setItem(MEMBER_USER_KEY, JSON.stringify(user));
};

export const getAdminToken = () => {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

export const getMemberToken = () => {
  return localStorage.getItem(MEMBER_TOKEN_KEY);
};

export const getAdminUser = () => {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_USER_KEY) || "{}");
  } catch {
    return {};
  }
};

export const getMemberUser = () => {
  try {
    return JSON.parse(localStorage.getItem(MEMBER_USER_KEY) || "{}");
  } catch {
    return {};
  }
};

export const getActivePortal = () => {
  const path = window.location.pathname;

  if (path.startsWith("/admin")) return "admin";
  if (path.startsWith("/member")) return "member";

  return "public";
};

export const getActiveToken = () => {
  const portal = getActivePortal();

  if (portal === "admin") return getAdminToken();
  if (portal === "member") return getMemberToken();

  return getMemberToken() || getAdminToken();
};

export const getActiveUser = () => {
  const portal = getActivePortal();

  if (portal === "admin") return getAdminUser();
  if (portal === "member") return getMemberUser();

  const memberUser = getMemberUser();
  const adminUser = getAdminUser();

  return memberUser?._id || memberUser?.id ? memberUser : adminUser;
};

export const logoutAdmin = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
};

export const logoutMember = () => {
  localStorage.removeItem(MEMBER_TOKEN_KEY);
  localStorage.removeItem(MEMBER_USER_KEY);
};

export const logoutActivePortal = () => {
  const portal = getActivePortal();

  if (portal === "admin") {
    logoutAdmin();
    return;
  }

  if (portal === "member") {
    logoutMember();
    return;
  }

  logoutAdmin();
  logoutMember();
};
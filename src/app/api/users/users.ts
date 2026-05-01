import { apiRequest } from '../../../common/api-request';

export interface AuthenticationData {
  username: string;
  password: string;
}

export const login = async (data: AuthenticationData) => {
  return await apiRequest({
    url: `/api/app-service/v1/authenticate`,
    method: 'POST',
    data: data,
  });
};

export const requestAccess = async (data: string) => {
  return await apiRequest({
    url: ` /api/app-service/v1/request-access`,
    method: 'POST',
  });
};

export const forgotPassword = async (data: string) => {
  return await apiRequest({
    url: ` /api/app-service/v1/passwordreset`,
    method: 'POST',
    data: data,
  });
};

export const getRoles = async () => {
  return await apiRequest({
    url: ` /api/app-service/v1/roles`,
    method: 'GET',
  });
};

export const deleteUser = async (id: number) => {
  return await apiRequest({
    url: ` /api/app-service/v1/users/${id}`,
    method: 'DELETE',
  });
};

export const statusChange = async (data: any) => {
  const status = data.data;
  return await apiRequest({
    url: ` /api/app-service/v1/users/${data.id}/change_activate_status`,
    method: 'PATCH',
    data: status,
  });
};

export const passwordreset = async (email: string) => {
  return await apiRequest({
    url: `/api/app-service/v1/passwordreset`,
    method: 'POST',
    data: {
      email,
    },
  });
};

export const addUser = async (data: any) => {
  return await apiRequest({
    url: `/api/app-service/v1/users`,
    method: 'POST',
    data: data,
  });
};

export const getUsers = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/users`,
    method: 'GET',
  });
};

export const getUsersForTask = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/users/getUsersForTask`,
    method: 'GET',
  });
};

export const getUserById = async (id: string) => {
  return await apiRequest({
    url: `/api/app-service/v1/users/getBYId/${id}`,
    method: 'GET',
  });
};

export const getNotApprovedUser = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/users?is_active=false&is_new=true`,
    method: 'GET',
  });
};

export const editUser = async (id: number, data: any) => {
  return await apiRequest({
    url: ` /api/app-service/v1/users/${id}`,
    method: 'PATCH',
    data: data,
  });
};

export const createNewPassword = async (data: any) => {
  return await apiRequest({
    url: `/api/app-service/v1/passwordreset/performreset`,
    method: 'POST',
    data: data,
  });
};

export const validateToken = async (token: string) => {
  return await apiRequest({
    url: `/api/app-service/v1/passwordreset/${token}`,
    method: 'GET',
  });
};

export const getMyRoles = async () => {
  return !localStorage.getItem('access_token')
    ? Promise.resolve({
        data: { user_status: 'NOT_LOGGED_IN' },
      })
    : apiRequest({
        url: '/api/app-service/v1/my-roles',
      }).catch((error) => {
        if (error?.response?.status === 401) {
          localStorage.removeItem('access_token');
        }
        return {
          data: { user_status: 'NOT_LOGGED_IN' },
        };
      });
};

export const sendOTP = async (email: string) => {
  return await apiRequest({
    url: `/api/app-service/v1/request-otp`,
    method: 'POST',
    data: { email },
  });
};

export const verifyOTP = async (otpObj: string) => {
  return await apiRequest({
    url: `/api/app-service/v1/verify-otp`,
    method: 'POST',
    data: otpObj,
  });
};

export const checkDomain = async (Obj: string) => {
  return await apiRequest({
    url: `/api/app-service/v1/configuration/check-valid-domain`,
    method: 'POST',
    data: Obj,
  });
};


export const getUserTeam = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/userteam`,
    method: 'GET',
  });
};

export const getUserHierarchy = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/users/getUserHierarchy`,
    method: 'GET',
  });
};
export const getOrganizationUsers = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/users/getOrganizationUsers`,
    method: 'GET',
  });
};

export const getOrganizationUsersHierarchy = async () => {
  return await apiRequest({
    url: `/api/app-service/v1/users/getOrganizationUserHierarchy`,
    method: 'GET',
  });
};
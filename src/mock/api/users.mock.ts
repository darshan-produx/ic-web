import { mockUsers, mockCurrentUser, mockRoles, mockUserTeam } from '../users';

const res = (data: any) => Promise.resolve({ data: { data, success: true } });

export const getUsers = async () => res(mockUsers);
export const getUsersForTask = async () => res(mockUsers);
export const getUserById = async (id: string) =>
  res(mockUsers.find((u) => String(u.id) === id || u._id === id) ?? null);
export const getRoles = async () => res(mockRoles);
export const getUserTeam = async () => res(mockUserTeam);
export const getUserHierarchy = async () => res(mockUsers);
export const getOrganizationUsers = async () => res(mockUsers);
export const getOrganizationUsersHierarchy = async () => res(mockUsers);
export const getNotApprovedUser = async () => res([]);

export const getMyRoles = async () =>
  Promise.resolve({
    data: {
      user_status: 'LOGGED_IN',
      user: mockCurrentUser,
      roles: [mockRoles[2]], // Team Lead
    },
  });

// Write operations
export const addUser = async (data: any) => res({ ...data, id: Date.now() });
export const editUser = async (id: number, data: any) => res({ id, ...data });
export const deleteUser = async (id: number) => res({ id, deleted: true });
export const statusChange = async (data: any) => res(data);
export const login = async (data: any) =>
  Promise.resolve({ data: { access_token: 'mock_token_rzp_2025', org_id: 'rzp_org_001' } });
export const sendOTP = async (email: string) => res({ email, sent: true });
export const verifyOTP = async (otpObj: any) => res({ verified: true });
export const passwordreset = async (email: string) => res({ email, sent: true });
export const createNewPassword = async (data: any) => res({ success: true });
export const validateToken = async (token: string) => res({ valid: true });
export const checkDomain = async (obj: any) => res({ valid: true });

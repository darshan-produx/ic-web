import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AuthenticationData,
  addUser,
  checkDomain,
  createNewPassword,
  deleteUser,
  editUser,
  forgotPassword,
  login,
  passwordreset,
  requestAccess,
  sendOTP,
  statusChange,
  validateToken,
  verifyOTP,
} from '../../app/api/users/users';

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AuthenticationData) => login(data),
    onSettled: async (data, error) => {
      if (error) console.log(error);
      else {
        await queryClient.invalidateQueries({ queryKey: ['roles'] });
      }
    },
    onSuccess: (res) => {
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('org_id', res.data.org_id);
    },
  });
}

export function useRequestAccess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (org_id: string) => requestAccess(org_id),
    onSettled: async (data, error) => {
      if (error) console.log(error);
      else {
        await queryClient.invalidateQueries({ queryKey: ['users'] });
      }
    },
  });
}

export function useForgotPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => forgotPassword(data),
    onSettled: async (data, error) => {
      if (error) console.log(error);
      else {
        await queryClient.invalidateQueries({
          queryKey: ['userForgotPassword'],
        });
      }
    },
  });
}

export function useAddUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => addUser(data),
    onSettled: async (data, error) => {
      if (error) console.log(error);
      else {
        //
      }
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['users'],
        exact: true,
      });

      queryClient.invalidateQueries({
        queryKey: ['newUsers'],
        exact: true,
      });
    },
  });
}

export function useEditUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      const id: any = data?.id;
      delete data.id;
      return editUser(id, data);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
      else {
        await queryClient.invalidateQueries({
          queryKey: ['users', 'newUsers'],
        });
      }
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['users'],
        exact: true,
      });

      queryClient.invalidateQueries({
        queryKey: ['newUsers'],
        exact: true,
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => {
      return deleteUser(id);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
      else {
        await queryClient.invalidateQueries({
          queryKey: ['newUsers', 'users'],
        });
      }
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['users'],
        exact: true,
      });

      queryClient.invalidateQueries({
        queryKey: ['newUsers'],
        exact: true,
      });
    },
  });
}

export function useStatusChange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      return statusChange(data);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
      else {
        await queryClient.invalidateQueries({
          queryKey: ['change-status', 'users'],
        });
      }
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({ queryKey: ['users'], exact: true });
    },
  });
}

export function usePasswordReset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      return passwordreset(data.username);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
      else {
        await queryClient.invalidateQueries({ queryKey: ['passwordreset'] });
      }
    },
    onSuccess(data, variables, context) {},
  });
}

export function useCreateNewPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      return createNewPassword(data);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
      else {
        await queryClient.invalidateQueries({ queryKey: ['new-password'] });
      }
    },
    onSuccess(data, variables, context) {},
  });
}

export function useValidateToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => {
      return validateToken(token);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
      else {
        await queryClient.invalidateQueries({ queryKey: ['validate-token'] });
      }
    },
    onSuccess(data, variables, context) {},
  });
}

export function useSendOTP() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => {
      return sendOTP(email);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
    },
    onSuccess(data, variables, context) {},
  });
}

export function useVerifyOTP() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (otpObj: any) => {
      return verifyOTP(otpObj);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
    },
    onSuccess(res) {
      //
    },
  });
}

export function useCheckDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => checkDomain(data),
    onSettled: async (data, error) => {
      if (error) console.log(error);
      else {
        //
      }
    },
    onSuccess: (res) => {
      //
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateGlobalEmailSettings } from '../../app/api/globalconfig/globalconfig';
import {
  deleteEmailbyId,
  downloadAttachment,
  editEmailbyId,
  sendEmail,
  setPasswordforEmail,
} from '../../app/api/emails/emails';

export function useEditEmailSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      return updateGlobalEmailSettings(data);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['getAllEmailSettings'],
        exact: true,
      });
    },
  });
}

export function usePatchEmailStarOrView() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      const id = data?._id;
      delete data?._id;
      return editEmailbyId(id, data);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
      else {
        await queryClient.invalidateQueries({
          queryKey: ['user-emails'],
        });
      }
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['user-emails'],
        exact: true,
      });
    },
  });
}

export function useSendEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => sendEmail(data),
    onSettled: async (data, error) => {
      if (error) console.log(error);
      else {
        await queryClient.invalidateQueries({
          queryKey: ['user-emails'],
        });
      }
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['user-emails'],
        exact: true,
      });
    },
  });
}

export function useDeleteEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      return deleteEmailbyId(data);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
      else {
        await queryClient.invalidateQueries({
          queryKey: ['user-emails'],
        });
      }
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['user-emails'],
        exact: true,
      });
    },
  });
}

export function useDownloadAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      return downloadAttachment(data?._id, data?.part);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
      else {
      }
    },
  });
}

export function useSetPasswordForEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      return setPasswordforEmail(data);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
      else {
        await queryClient.invalidateQueries({
          queryKey: ['last-sync-email'],
        });
      }
    },
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries({
        queryKey: ['last-sync-email'],
        exact: true,
      });
    },
  });
}

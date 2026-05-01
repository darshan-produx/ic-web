import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  deleteMeeting,
  updateAllMeetingSuggetions,
  updateMeeting,
  updateSingleMeetingSuggetion,
  uploadMeetingsMOM,
  uploadTranscript,
} from '../../app/api/communication/communication';

export function useUploadTranscript() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => uploadTranscript(data),
    onSettled: async (data, error) => {
      if (error) console.log(error);
    },
    onSuccess: (res, validate, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['meetings'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['customerJourney'],
        exact: false,
      });
    },
  });
}


export function useUploadMeetingNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => uploadMeetingsMOM(data),
    onSettled: async (data, error) => {
      if (error) console.log(error);
    },
    onSuccess: (res, validate, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['meetings'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['customerJourney'],
        exact: false,
      });
    },
  });
}


export function useDeleteMeeting() {
  const QueryCLient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => deleteMeeting(data.id, data.keepSuggestion),
    onSettled: async (data, error) => {
      if (error) console.log(error);
    },
    onSuccess: (res, validate, variables) => {
      QueryCLient.invalidateQueries({
        queryKey: ['meetings'],
        exact: false,
      });
      QueryCLient.invalidateQueries({
        queryKey: ['customerJourney'],
        exact: false,
      });
    },
  });
}
export function useUpdateSingleSuggestionMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      const id = data?.id;
      const action = data?.action;
      delete data?.id;
      delete data?.action;
      return updateSingleMeetingSuggetion(id, data, action);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
    },
    onSuccess: (res, validate, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['meetingSuggetions'],
        exact: false,
      });
    },
  });
}

export function useUpdateAllSuggestionMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      return updateAllMeetingSuggetions(data);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
    },
    onSuccess: (res, validate, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['meetingSuggetions'],
        exact: false,
      });
    },
  });
}

export function useUpdateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => {
      const id = data?.id;
      delete data?.id;

      return updateMeeting(id, data);
    },
    onSettled: async (data, error) => {
      if (error) console.log(error);
    },
    onSuccess: (res, validate, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['meetingSuggetions'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['meetings'],
        exact: false,
      });
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AskAIAPI,
  deleteCustomResearchChatConversation,
} from '../../app/api/askAI/askAI';

export function useAskAIChatbotApi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => {
      const type = data?.type;
      delete data?.type;
      return AskAIAPI(type, data);
    },

    onSettled: (data, error) => {
      // Optionally handle settled state, you might not need to invalidate a specific query here
    },
  });
}

export function useDeleteResearchCustomConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: any) => {
      return deleteCustomResearchChatConversation(id);
    },

    onSettled: (data, error) => {
      // Optionally handle settled state, you might not need to invalidate a specific query here
    },
  });
}
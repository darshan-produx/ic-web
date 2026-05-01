import { apiRequest } from '../../../common/api-request';
import { create } from 'zustand';
export const useCommunicationStore = create((set: any) => ({
  uploadProgress: { percent: 0, id: '' },
  uploadTranscript: async (data: any) => {
    set({ uploadProgress: 0 });
    const formData: any = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (typeof value === 'object' && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });

    return apiRequest({
      url: '/api/app-service/v1/customer-meeting/create-meeting',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: any) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        set({
          uploadProgress: {
            percent: percentCompleted,
            id: formData?.get('meeting_id'),
          },
        });
      },
    });
  },
}));

import { useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = 'http://127.0.0.1:8000/api/v1.0';

// Hook for uploading images to a user's general gallery
export const useUploadUserImages = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      // The uploader_id=1 is hardcoded here as per the backend endpoint.
      // In a real app, this would be the current user's ID.
      const response = await fetch(`${API_URL}/upload_file?uploader_id=1`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate the main user images query to show the new photo
      queryClient.invalidateQueries({ queryKey: ['usersImages'] });
    },
  });
};


export const useUploadGroupImages = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ groupId, files }: { groupId: number; files: File[] }) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`${API_URL}/upload/${groupId}/upload_file`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupImages', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};

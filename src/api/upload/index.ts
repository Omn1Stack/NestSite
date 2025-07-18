import { useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = 'http://127.0.0.1:8000/api/v1.0';

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

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = 'http://127.0.0.1:8000/api/v1.0';
const user_id = 1; // Replace with the actual user ID

// Fetch all groups
export const useGetGroups = () => {
  return useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/get_groups/${user_id}`);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      console.log('====================================');
      console.log('Fetching groups from: ', data);
      console.log('====================================');
      
       return data.groups || [];
    },
  });
};

// Create a new group
export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newGroup: { name: string; description?: string; user_id: number }) => {
      const response = await fetch(`${API_URL}/new_group/${newGroup.user_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newGroup.name, description: newGroup.description }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};

// Update a group
export const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updatedGroup: { group_id: number; name: string; description?: string }) => {
      const response = await fetch(`${API_URL}/update_group/${updatedGroup.group_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: updatedGroup.name, description: updatedGroup.description }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};

// Delete a group
export const useDeleteGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (groupId: number) => {
      const response = await fetch(`${API_URL}/delete_group/${groupId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};

// Fetch images for a specific group
export const useGetGroupImages = (groupId: number | null) => {
  return useQuery({
    queryKey: ['groupImages', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const response = await fetch(`${API_URL}/get_images_by_group/${groupId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data.images || [];
    },
    enabled: !!groupId, // Only run the query if a groupId is selected
  });
};

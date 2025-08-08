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

export const deleteGroupPhoto = async (photoId: number, groupId: number): Promise<void> => {
  const res = await fetch(`${API_URL}/delete_group_file/${groupId}/${photoId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ detail: "Failed to delete group image" }));
    throw new Error(errorData.detail || `Failed to delete photo ${photoId} from group ${groupId}`);
  }
};

export const deleteMultipleGroupPhotos = async (
  photoIds: number[],
  groupId: number
): Promise<{ success: number[], failed: Array<{ id: number, error: string }> }> => {
  const results = {
    success: [] as number[],
    failed: [] as Array<{ id: number, error: string }>
  };

  const deletePromises = photoIds.map(async (photoId) => {
    try {
      await deleteGroupPhoto(photoId, groupId);
      results.success.push(photoId);
      return { status: 'fulfilled', photoId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.failed.push({ id: photoId, error: errorMessage });
      return { status: 'rejected', photoId, error: errorMessage };
    }
  });

  await Promise.allSettled(deletePromises);
  return results;
};

export interface DeletePhotoParams {
  photoId: number;
  groupId: number;
}

export interface BulkDeleteParams {
  photoIds: number[];
  groupId: number;
}

export interface DeleteResult {
  success: number[];
  failed: Array<{ id: number, error: string }>;
}

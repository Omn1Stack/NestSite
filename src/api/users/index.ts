import { useQuery } from '@tanstack/react-query';

const API_URL = 'http://127.0.0.1:8000/api/v1.0';

// Fetch all users with their images
export const useUsersImages = () => {
  return useQuery({
    queryKey: ['usersImages'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/users/images`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      // The backend returns an object with a 'users' key
      return data.users || [];
    },
  });
};

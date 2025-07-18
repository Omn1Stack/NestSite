import { useQuery } from "@tanstack/react-query";
import { photoType } from "@/types/photosType";

const getUsersImages = async (): Promise<photoType[]> => {
  const response = await fetch("http://127.0.0.1:8000/api/v1.0/get_users_images");

  if (!response.ok) {
    throw new Error("Failed to fetch images");
  }
  
  const data = await response.json();
  console.log("Fetched user images:", data); // This log is helpful for debugging

  // The backend returns an array of user objects.
  // Each user object has an 'images' array.
  // Each image in that array needs to be transformed into our `photoType`.
  const allPhotos: photoType[] = [];

  data.forEach((user: any) => {
    if (user.images && Array.isArray(user.images)) {
      const userPhotos = user.images.map((image: any) => {
        if (!image) return null; // Guard against null/undefined entries in the images array
        return {
          id: String(image.image_id), // Convert number to string for component consistency
          image_url: image.image_url,
          alt: image.original_filename,
          date: image.upload_date,
          // location and groupId are optional and not present in this API response
        };
      });
      allPhotos.push(...userPhotos);
    }
  });

  return allPhotos.filter(Boolean) as photoType[]; // Filter out any null entries
};

export const useUsersImages = () => {
  return useQuery<photoType[], Error>({
    queryKey: ["usersImages"],
    queryFn: getUsersImages,
  });
};

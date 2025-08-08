import { useInfiniteQuery } from "@tanstack/react-query";
import { photoType } from "@/types/photosType";

const getImages = async ({ pageParam = 1, limit = 12 }): Promise<{ photos: photoType[], nextPage: number | null }> => {
  const response = await fetch(`http://127.0.0.1:8000/api/v1.0/images?page=${pageParam}&limit=${limit}`);

  if (!response.ok) {
    throw new Error("Failed to fetch images");
  }
  
  const data = await response.json();
  
  const fetchedPhotos: photoType[] = data.photos.map((image: any) => ({
    id: String(image.image_id),
    image_url: image.image_url,
    alt: image.original_filename,
    date: image.upload_date,
  }));

  return {
    photos: fetchedPhotos,
    nextPage: fetchedPhotos.length === limit ? pageParam + 1 : null,
  };
};

export const useImages = (limit: number = 12) => {
  return useInfiniteQuery<Awaited<ReturnType<typeof getImages>>, Error>({
    queryKey: ["images", limit],
    queryFn: ({ pageParam }) => getImages({ pageParam, limit }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });
};

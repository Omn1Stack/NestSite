import { Crop } from "react-image-crop";
import { useInfiniteQuery } from "@tanstack/react-query";
import { photoType } from "@/types/photosType";

const API_BASE_URL = "http://127.0.0.1:8000/api/v1.0";



const getImages = async ({ user_id, pageParam = 1, limit = 12 }): Promise<{ photos: photoType[], nextPage: number | null }> => {
  const response = await fetch(`${API_BASE_URL}/images/by_user/${user_id}?page=${pageParam}&limit=${limit}`);

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

export const useImages = (user_id: number, limit: number = 12) => {
  return useInfiniteQuery<Awaited<ReturnType<typeof getImages>>, Error>({
    queryKey: ["images", user_id, limit],
    queryFn: ({ pageParam }) => getImages({ user_id, pageParam, limit }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    enabled: !!user_id, // Only run the query if user_id is available
  });
};




export const getPhotoUrl = async (photoId: number): Promise<{ url: string }> => {
  const res = await fetch(`${API_BASE_URL}/images/${photoId}`);
  if (!res.ok) {
    throw new Error("Failed to fetch image URL");
  }
  return res.json();
};

export const fetchImageBlob = async (url: string): Promise<Blob> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch image from ${url}`);
  }
  return res.blob();
};

export const rotatePhoto = async (photoId: number, angle: number): Promise<Blob> => {
  const res = await fetch(`${API_BASE_URL}/images/${photoId}/rotate?angle=${angle}`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error("Failed to rotate image");
  }
  return res.blob();
};

export const replacePhoto = async (
  photoId: number,
  imageData: Blob
): Promise<any> => {
  const res = await fetch(`${API_BASE_URL}/images/${photoId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "image/png",
    },
    body: imageData,
  });
  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ detail: "Failed to replace image" }));
    throw new Error(errorData.detail);
  }
  return res.json();
};

export const duplicatePhoto = async (
  photoId: number,
  imageData: Blob
): Promise<any> => {
  const res = await fetch(`${API_BASE_URL}/images/${photoId}/duplicate`, {
    method: "POST",
    headers: {
      "Content-Type": "image/png",
    },
    body: imageData,
  });
  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ detail: "Failed to save new image" }));
    throw new Error(errorData.detail);
  }
  return res.json();
};

export const cropPhoto = async (
  photoId: number,
  crop: Crop,
  image: HTMLImageElement
): Promise<Blob> => {
  if (!crop.width || !crop.height || !image) {
    throw new Error("Invalid crop or image");
  }

  let { x, y, width, height, unit } = crop;

  let left: number, upper: number, right: number, lower: number;

  if (unit === "%") {
    left = Math.round((x / 100) * image.naturalWidth);
    upper = Math.round((y / 100) * image.naturalHeight);
    right = Math.round(((x + width) / 100) * image.naturalWidth);
    lower = Math.round(((y + height) / 100) * image.naturalHeight);
  } else {
    // Assume pixels ('px')
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    left = Math.round(x * scaleX);
    upper = Math.round(y * scaleY);
    right = Math.round((x + width) * scaleX);
    lower = Math.round((y + height) * scaleY);
  }

  // The backend expects left, upper, right, lower in original image dimensions
  const cropParams = new URLSearchParams({
    left: left.toString(),
    upper: upper.toString(),
    right: right.toString(),
    lower: lower.toString(),
  }).toString();

  const res = await fetch(
    `${API_BASE_URL}/images/${photoId}/crop?${cropParams}`,
    {
      method: "POST",
    }
  );
  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ detail: "Failed to crop image" }));
    throw new Error(errorData.detail);
  }
  return res.blob();
};

export const applyFilter = async (
  photoId: number,
  filterName: string,
  params: Record<string, any> = {}
): Promise<Blob> => {
  const res = await fetch(`${API_BASE_URL}/images/${photoId}/filter/${filterName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ detail: `Failed to apply ${filterName} filter` }));
    throw new Error(errorData.detail);
  }
  return res.blob();
};



export const deletePhoto = async (photoId: number): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/delete_file/${photoId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ detail: "Failed to delete image" }));
    throw new Error(errorData.detail || `Failed to delete photo with ID ${photoId}`);
  }
};

export const deleteGroupPhoto = async (photoId: number, groupId: number): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/delete_group_file/${groupId}/${photoId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ detail: "Failed to delete group image" }));
    throw new Error(errorData.detail || `Failed to delete photo ${photoId} from group ${groupId}`);
  }
};



// Bulk delete function - handles multiple photos at once
export const deleteMultiplePhotos = async (
  photoIds: number[],
  groupId?: number
): Promise<{ success: number[], failed: Array<{ id: number, error: string }> }> => {
  const results = {
    success: [] as number[],
    failed: [] as Array<{ id: number, error: string }>
  };

  // Use Promise.allSettled to handle all deletions, even if some fail
  const deletePromises = photoIds.map(async (photoId) => {
    try {
      if (groupId) {
        await deleteGroupPhoto(photoId, groupId);
      } else {
        await deletePhoto(photoId);
      }
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
  groupId?: number;
}

export interface BulkDeleteParams {
  photoIds: number[];
  groupId?: number;
}

export interface DeleteResult {
  success: number[];
  failed: Array<{ id: number, error: string }>;
}

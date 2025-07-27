import { Crop } from "react-image-crop";

const API_BASE_URL = "http://127.0.0.1:8000/api/v1.0";

// --- Existing API Functions ---

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
import { useQuery } from "@tanstack/react-query";
import { photoType } from "@/types/photosType";

const API_BASE_URL = "http://127.0.0.1:8000/api/v1.0";

export interface SearchResult {
  image_id: string;
  image_url: string;
  original_filename: string;
  upload_date: string;
  score?: number; // Similarity score if returned by your API
}

export const searchImages = async (query: string): Promise<photoType[]> => {
  if (!query.trim()) {
    throw new Error("Search query cannot be empty");
  }

  const response = await fetch(`${API_BASE_URL}/search/images?query=${encodeURIComponent(query)}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Failed to search images" }));
    throw new Error(errorData.detail || `Search failed with status: ${response.status}`);
  }

  const data: SearchResult[] = await response.json();
  
  // Transform the API response to match our photoType interface
  const searchResults: photoType[] = data.map((result) => ({
    id: result.image_id,
    image_url: result.image_url,
    alt: result.original_filename,
    date: result.upload_date,
    original_filename: result.original_filename,
    score: result.score, // Optional similarity score
  }));
  console.log("Search results:", searchResults);

  return searchResults;
};

export const useSearchImages = (
  query: string,
  options: { enabled: boolean } = { enabled: false }
) => {
  return useQuery({
    queryKey: ["searchImages", query],
    queryFn: () => searchImages(query),
    enabled: options.enabled && !!query.trim(), // Only run when enabled and query is not empty
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Alternative hook for manual triggering
export const useSearchImagesMutation = () => {
  const { refetch, ...queryResult } = useQuery({
    queryKey: ["searchImages"],
    queryFn: () => Promise.resolve([]), // Dummy function, will be overridden
    enabled: false, // Never auto-run
  });

  const searchMutation = async (query: string) => {
    if (!query.trim()) {
      throw new Error("Search query cannot be empty");
    }
    
    const result = await searchImages(query);
    return result;
  };

  return {
    ...queryResult,
    searchImages: searchMutation,
  };
};
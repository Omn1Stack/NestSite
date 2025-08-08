import { useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = "http://127.0.0.1:8000/api/v1.0";

export const useAiEnhancement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      photoId,
      enhancementMode,
    }: {
      photoId: number;
      enhancementMode: string;
    }): Promise<Blob> => {
      const res = await fetch(
        `${API_BASE_URL}/images/${photoId}/enhance/${enhancementMode}`,
        {
          method: "POST",
        }
      );
      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ detail: "Failed to apply AI enhancement" }));
        throw new Error(errorData.detail);
      }
      return res.blob();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });
};

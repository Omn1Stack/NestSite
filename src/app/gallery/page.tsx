"use client";

import PhotoLayout from '@/components/PhotoLayout';
import { useImages } from '@/api/images/images';
import React from 'react';
import { FiLoader, FiAlertTriangle } from 'react-icons/fi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteGroupPhoto, deleteMultiplePhotos, deletePhoto } from '@/api/images/images';

const Gallery = () => {
  // TODO: Replace with dynamic user ID
  const currentUserId = 1;
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useImages(currentUserId);
  const queryClient = useQueryClient();

  // --- Mutation for single delete ---
  const deleteSingleMutationHook = useMutation({
    mutationFn: async ({ photoId, groupId }: { photoId: number, groupId?: number }) => {
      if (groupId) {
        await deleteGroupPhoto(photoId, groupId);
      } else {
        await deletePhoto(photoId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images', currentUserId] });
    },
  });

  // --- Mutation for bulk delete ---
  const deleteBulkMutationHook = useMutation({
    mutationFn: async ({ photoIds, groupId }: { photoIds: number[], groupId?: number }) => {
      return await deleteMultiplePhotos(photoIds, groupId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images', currentUserId] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FiLoader className="animate-spin text-purple-500 text-4xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-red-900/20 p-8 text-center">
        <FiAlertTriangle className="text-red-400 text-4xl mb-4" />
        <h3 className="text-xl font-semibold text-red-400">Error Fetching Gallery</h3>
        <p className="text-red-300">{error?.message}</p>
      </div>
    );
  }

  // Extract photos from infinite query pages
  const photos = data?.pages?.flatMap(page => page.photos) || [];

  return (
    <PhotoLayout
      photos={photos}
      title="Gallery"
      groupId={null}
      deleteSingleMutation={deleteSingleMutationHook}
      deleteBulkMutation={deleteBulkMutationHook}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
    />
  );
};

export default Gallery;

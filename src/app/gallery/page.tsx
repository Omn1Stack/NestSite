"use client";

import PhotoLayout from '@/components/PhotoLayout';
import { useUsersImages } from '@/api/users';
import React from 'react';
import { FiLoader, FiAlertTriangle } from 'react-icons/fi';

const Gallery = () => {
  const { data: photos, isLoading, isError, error } = useUsersImages();

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
        <h3 className="text-xl font-semibold text-red-400">
          Error Fetching Gallery
        </h3>
        <p className="text-red-300">{error?.message}</p>
      </div>
    );
  }

  // The data is already an array of photo objects, no need to extract
  console.log("Photos data:", photos);

  return (
    <>
      <PhotoLayout photos={photos || []} title="Gallery" />
    </>
  );
};

export default Gallery;
"use client";

import { useImages } from "@/api/images/images";
import Spinner from "@/components/Spinner";
import { useMemo, useEffect, memo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { FiX } from "react-icons/fi";
import { motion } from "framer-motion";
import React from "react";

// --- Main Modal Component ---
const ImageSelectionModal = ({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (photo: any) => void;
}) => {
  const currentUserId = 1; // TODO: Replace with dynamic user ID
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useImages(currentUserId, 18);

  const photos = useMemo(
    () => data?.pages.flatMap((page) => page.photos) ?? [],
    [data]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    }
    
    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const renderContent = () => {
    if (!photos || photos.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-800/50 rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-200">No Photos Found</h3>
          <p className="text-gray-400">Upload some photos to get started.</p>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
      >
        {photos.map((photo) => (
          <motion.div
            key={photo.id}
            whileHover={{ scale: 1.02 }}
            className="relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-purple-500 transition-colors cursor-pointer"
            onClick={() => onSelect(photo)}
          >
            <Image
              src={photo.image_url}
              alt={photo.alt || photo.original_filename}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center pb-3">
              <span className="text-white text-sm font-medium">Select</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  if (!isOpen) return null;

  if (isLoading) {
    return createPortal(
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-5xl flex flex-col max-h-[90vh]">
          <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-gray-700/50">
            <div>
              <h3 className="font-bold text-xl text-white">Select Your Photo</h3>
              <p className="text-gray-400 text-sm mt-1">Choose a photo to enhance</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-200"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>
          <div className="p-6 flex items-center justify-center min-h-[300px]">
            <div className="text-center">
              <Spinner />
              <p className="text-gray-400 mt-4">Loading your photos...</p>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-5xl flex flex-col max-h-[90vh]">
        <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-gray-700/50">
          <div>
            <h3 className="font-bold text-xl text-white">Select Your Photo</h3>
            <p className="text-gray-400 text-sm mt-1">Choose a photo to enhance</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-200"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {renderContent()}
          
          {hasNextPage && (
            <div className="mt-8 flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-full text-lg transition-all disabled:opacity-50"
              >
                {isFetchingNextPage ? "Loading..." : "Load More"}
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ImageSelectionModal;
"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  FiX, 
  FiSearch, 
  FiLoader,
  FiAlertCircle,
  FiImage
} from "react-icons/fi";
import { photoType } from "@/types/photosType";
import { useSearchImages } from "@/api/search";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (photo: photoType, allPhotos: photoType[], currentIndex: number) => void;
  initialQuery?: string;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onImageSelect,
  initialQuery = ""
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [mounted, setMounted] = useState(false);

  const {
    data: searchResults = [],
    isLoading,
    error,
    refetch,
  } = useSearchImages(query, { enabled: false });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleImageClick = (photo: photoType) => {
    const currentIndex = searchResults.findIndex(p => p.id === photo.id);
    onImageSelect(photo, searchResults, currentIndex);
  };

  const handleClose = () => {
    onClose();
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <AnimatePresence mode="wait">
      <motion.div
        key="search-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <motion.div
          key="search-modal-content"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiSearch className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                Search Images
              </h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <FiX className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Search Form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!query.trim()) return;
              refetch();
            }} className="flex gap-3">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for images by description, objects, or keywords..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={!query.trim() || isLoading}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <FiLoader className="h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <FiSearch className="h-4 w-4" />
                    Search
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <FiLoader className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Searching for images...</p>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <FiAlertCircle className="h-8 w-8 text-red-500 mb-4" />
                <p className="text-red-600 dark:text-red-400 mb-2">Search failed</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
                  {error.message || "An error occurred while searching for images."}
                </p>
                <button
                  onClick={() => refetch()}
                  className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* No Results */}
            {!isLoading && !error && searchResults.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <FiImage className="h-8 w-8 text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">No images found</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm text-center">
                  Try using different keywords or check your search terms.
                </p>
              </div>
            )}

            {/* Initial State */}
            {!isLoading && searchResults.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Found {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {searchResults.map((photo, index) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="group cursor-pointer"
                      onClick={() => handleImageClick(photo)}
                    >
                      <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                        <Image
                          src={photo.image_url}
                          alt={photo.alt || "search result image"}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                        
                        {/* Hover overlay */}
                        <div className="absolute inset-0 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-full p-3 bg-gradient-to-t from-black/80 to-transparent">
                            <p className="text-white text-xs font-medium truncate">
                              {photo.alt}
                            </p>
                            {photo.score && (
                              <p className="text-white/70 text-xs">
                                {Math.round(photo.score * 100)}% match
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};
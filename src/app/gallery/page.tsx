"use client";

import PortalMenu from "@/components/PortalMenu";
import { photos } from "@/Utils/samplePhotos";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  FiColumns,
  FiFilter,
  FiGrid,
  FiList,
  FiMoreHorizontal,
  FiPlus,
  FiSearch,
} from "react-icons/fi";

const Gallery = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list" | "masonry">(
    "masonry"
  );
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [activeMenuPhoto, setActiveMenuPhoto] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  // Check if desktop on mount
  useEffect(() => {
    setIsDesktop(window.innerWidth >= 768);
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Toggle photo selection (desktop only)
  const togglePhotoSelection = (id: string) => {
    if (isDesktop) {
      setSelectedPhotos((prev) =>
        prev.includes(id)
          ? prev.filter((photoId) => photoId !== id)
          : [...prev, id]
      );
    }
  };

  // Handle mobile menu toggle
  const toggleMobileMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuPhoto((prev) => (prev === id ? null : id));
  };

  // Photo actions
  const handlePhotoAction = (action: string, id: string) => {
    console.log(`${action} photo:`, id);
    setActiveMenuPhoto(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-20">
      {/* Gallery Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Your Photo Gallery</h1>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-grow md:flex-grow-0">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search photos..."
                className="bg-gray-800 rounded-full py-2 pl-10 pr-4 text-white w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode("masonry")}
                className={`p-2 rounded-md ${
                  viewMode === "masonry" ? "bg-purple-600" : "hover:bg-gray-700"
                }`}
                aria-label="Masonry view"
              >
                <FiColumns />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md ${
                  viewMode === "grid" ? "bg-purple-600" : "hover:bg-gray-700"
                }`}
                aria-label="Grid view"
              >
                <FiGrid />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md ${
                  viewMode === "list" ? "bg-purple-600" : "hover:bg-gray-700"
                }`}
                aria-label="List view"
              >
                <FiList />
              </button>
            </div>

            {/* Upload Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full flex items-center gap-2"
            >
              <FiPlus /> Upload
            </motion.button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-full text-sm">
            All Photos
          </button>
          <button className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
            <FiFilter /> Recently Added
          </button>
          <button className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-full text-sm">
            Favorites
          </button>
          <button className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-full text-sm">
            People
          </button>
          <button className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-full text-sm">
            Places
          </button>
        </div>
      </motion.div>

      {/* Photos Display - Grid View */}
      {viewMode === "grid" ? (
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
              className={`relative aspect-square rounded-xl overflow-hidden border-2 ${
                selectedPhotos.includes(photo.id)
                  ? "border-purple-500"
                  : "border-transparent"
              }`}
              onClick={() => isDesktop && togglePhotoSelection(photo.id)}
            >
              <Image
                src={photo.url}
                alt={photo.alt}
                fill
                className="object-cover cursor-pointer"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              />

              {/* Mobile menu button */}
              {!isDesktop && (
                <div className="absolute top-1 right-1">
                  <button
                    onClick={(e) => toggleMobileMenu(photo.id, e)}
                    className="p-1 bg-gray-900/80 rounded-full hover:bg-gray-700"
                  >
                    <FiMoreHorizontal className="h-4 w-4 text-white" />
                  </button>
                </div>
              )}

              {/* Desktop selection indicator */}
              {isDesktop && selectedPhotos.includes(photo.id) && (
                <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">
                      {selectedPhotos.indexOf(photo.id) + 1}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      ) : viewMode === "list" ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-2"
        >
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              whileHover={{ x: isDesktop ? 5 : 0 }}
              className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer ${
                selectedPhotos.includes(photo.id)
                  ? "bg-purple-500/20"
                  : "bg-gray-800/50 hover:bg-gray-800"
              }`}
              onClick={() => isDesktop && togglePhotoSelection(photo.id)}
            >
              <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
                <Image
                  src={photo.url}
                  alt={photo.alt}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-grow">
                <h3 className="font-medium">{photo.alt}</h3>
                <div className="flex gap-4 text-sm text-gray-400">
                  {photo.date && <span>{photo.date}</span>}
                  {photo.location && <span>{photo.location}</span>}
                </div>
              </div>

              {/* Mobile menu button for list view */}
              {!isDesktop && (
                <div className="relative">
                  <button
                    onClick={(e) => toggleMobileMenu(photo.id, e)}
                    className="p-1 bg-gray-900/80 rounded-full hover:bg-gray-700"
                  >
                    <FiMoreHorizontal className="h-4 w-4 text-white" />
                  </button>
                </div>
              )}

              {/* Desktop selection indicator */}
              {isDesktop && selectedPhotos.includes(photo.id) && (
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">
                    {selectedPhotos.indexOf(photo.id) + 1}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      ) : (
        // Masonry View
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4"
        >
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              whileHover={{ scale: 1.02 }}
              className={`relative break-inside-avoid rounded-xl overflow-hidden border-2 ${
                selectedPhotos.includes(photo.id)
                  ? "border-purple-500"
                  : "border-transparent"
              }`}
              onClick={() => isDesktop && togglePhotoSelection(photo.id)}
            >
              <Image
                src={photo.url}
                alt={photo.alt}
                width={500}
                height={750}
                className="w-full h-full object-cover cursor-pointer"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              />

              {/* Mobile menu button */}
              {!isDesktop && (
                <div className="absolute top-1 right-1">
                  <button
                    onClick={(e) => toggleMobileMenu(photo.id, e)}
                    className="p-1 bg-gray-900/80 rounded-full hover:bg-gray-700"
                  >
                    <FiMoreHorizontal className="h-4 w-4 text-white" />
                  </button>
                </div>
              )}

              {/* Desktop selection indicator */}
              {isDesktop && selectedPhotos.includes(photo.id) && (
                <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">
                      {selectedPhotos.indexOf(photo.id) + 1}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Portal Menu for Mobile */}
      {activeMenuPhoto && !isDesktop && (
        <PortalMenu
          photoId={activeMenuPhoto}
          onClose={() => setActiveMenuPhoto(null)}
          onAction={handlePhotoAction}
        />
      )}

      {/* Desktop Selection Bar */}
      {isDesktop && selectedPhotos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 border border-gray-700 rounded-full px-6 py-3 shadow-lg flex gap-4 items-center z-50"
        >
          <span className="text-purple-400">
            {selectedPhotos.length} selected
          </span>
          <button className="hover:text-purple-400">Share</button>
          <button className="hover:text-purple-400">Download</button>
          <button className="hover:text-purple-400">Add to Album</button>
          <button className="text-red-400 hover:text-red-300">Delete</button>
        </motion.div>
      )}
    </div>
  );
};

export default Gallery;

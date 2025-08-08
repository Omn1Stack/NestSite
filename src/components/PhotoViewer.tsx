"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  FiX, 
  FiDownload, 
  FiHeart, 
  FiShare2, 
  FiTrash2, 
  FiEdit3, 
  FiMaximize2, 
  FiMinimize2,
  FiZoomIn,
  FiZoomOut,
  FiRotateCw,
  FiInfo,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";

import { photoType } from "@/types/photosType";

// The data for the photo itself
type PhotoData = photoType

// The props for our truly reusable PhotoViewer component
interface PhotoViewerProps {
  // Data
  photo: PhotoData;
  allPhotosCount: number;
  currentIndex: number;
  
  // State from parent
  isLiked: boolean;
  isDownloading: boolean;

  // Event handlers from parent
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onDelete: () => void;
  onDownload: () => void;
  onShare: () => void;
  onLike: () => void;
  onEdit: () => void; 
}

export const PhotoViewer: React.FC<PhotoViewerProps> = ({
  photo,
  allPhotosCount,
  currentIndex,
  isLiked,
  isDownloading,
  onClose,
  onNext,
  onPrevious,
  onDelete,
  onDownload,
  onShare,
  onLike,
  onEdit
}) => {
  // Internal UI state that does not affect the parent
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  // Navigation availability
  const canGoNext = currentIndex < allPhotosCount - 1;
  const canGoPrevious = currentIndex > 0;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault();
      switch (e.key) {
        case "Escape": onClose(); break;
        case "f": setIsFullscreen(p => !p); break;
        case "i": setShowInfo(p => !p); break;
        case "ArrowLeft": if (canGoPrevious) onPrevious(); break;
        case "ArrowRight": if (canGoNext) onNext(); break;
        case "+": case "=": setZoom(p => Math.min(p + 0.25, 3)); break;
        case "-": setZoom(p => Math.max(p - 0.25, 0.5)); break;
        case "r": setRotation(p => (p + 90) % 360); break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [canGoPrevious, canGoNext, onPrevious, onNext, onClose]);

  if (!photo) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
        onClick={onClose}
      >
        {/* Main Modal Content */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="relative w-full h-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <header className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
                  <FiX className="h-6 w-6" />
                </button>
                <div>
                  <h1 className="font-semibold text-lg">{photo.alt}</h1>
                  <p className="text-sm text-gray-400">
                    {currentIndex + 1} of {allPhotosCount}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={onLike} className={`p-2 hover:bg-white/10 rounded-full ${isLiked ? 'text-red-500' : ''}`}>
                  <FiHeart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <button onClick={onShare} className="p-2 hover:bg-white/10 rounded-full">
                  <FiShare2 className="h-5 w-5" />
                </button>
                <button onClick={onDownload} disabled={isDownloading} className="p-2 hover:bg-white/10 rounded-full disabled:opacity-50">
                  <FiDownload className="h-5 w-5" />
                </button>
                <button onClick={() => setShowInfo(!showInfo)} className={`p-2 hover:bg-white/10 rounded-full ${showInfo ? 'bg-white/20' : ''}`}>
                  <FiInfo className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          {/* Image Viewer */}
          <div className="flex-1 flex items-center justify-center p-4 h-full relative">
            {canGoPrevious && (
              <button onClick={onPrevious} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full z-20">
                <FiChevronLeft className="h-6 w-6" />
              </button>
            )}
            {canGoNext && (
              <button onClick={onNext} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full z-20">
                <FiChevronRight className="h-6 w-6" />
              </button>
            )}

            <motion.div
              key={photo.id}
              initial={{ opacity: 0.5, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                scale: zoom,
                rotate: rotation
              }}
              className="relative max-w-full max-h-full flex items-center justify-center"
            >
              <Image
                src={photo.image_url}
                alt={photo.alt}
                width={1200}
                height={800}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                priority
                quality={90}
                style={{
                  transform: isFullscreen ? 'none' : 'scale(1)',
                }}
              />
            </motion.div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 rounded-full px-4 py-2 flex items-center gap-2">
            <button onClick={() => setZoom(p => Math.max(p - 0.25, 0.5))} className="p-2 hover:bg-white/10 rounded-full"><FiZoomOut /></button>
            <span className="text-sm px-2">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(p => Math.min(p + 0.25, 3))} className="p-2 hover:bg-white/10 rounded-full"><FiZoomIn /></button>
            <div className="w-px h-6 bg-gray-600 mx-2" />
            <button onClick={() => setRotation(p => (p + 90) % 360)} className="p-2 hover:bg-white/10 rounded-full"><FiRotateCw /></button>
            <button onClick={() => setIsFullscreen(p => !p)} className="p-2 hover:bg-white/10 rounded-full">
              {isFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
            </button>
          </div>

          {/* Info Sidebar */}
          <AnimatePresence>
            {showInfo && (
              <motion.aside
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="absolute top-0 right-0 bottom-0 w-80 bg-gray-900/90 backdrop-blur-sm border-l border-gray-800 p-6 overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Details</h2>
                  <button onClick={() => setShowInfo(false)} className="p-1 hover:bg-gray-800 rounded"><FiX /></button>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">INFO</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-400">Filename</span><span className="truncate ml-2">{photo.original_filename}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">Date</span><span>{photo.date ? new Date(photo.date).toLocaleDateString() : 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-400">ID</span><span>{photo.id}</span></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">ACTIONS</h3>
                    <div className="space-y-2">
                      <button onClick={onEdit} className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg"><FiEdit3 /><span>Edit Photo</span></button>
                      <button onClick={onDelete} className="w-full flex items-center gap-3 p-3 hover:bg-red-900/20 text-red-400 rounded-lg"><FiTrash2 /><span>Delete Photo</span></button>
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
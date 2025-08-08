"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { 
  FiArrowLeft, 
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
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiMoreHorizontal
} from "react-icons/fi";
import { toast } from "react-toastify";

import { useImages, getPhotoUrl, deletePhoto, fetchImageBlob } from "@/api/images/images";
import { photoType } from "@/types/photosType";

interface PhotoData extends photoType {
  size?: string;
  dimensions?: string;
  camera?: string;
  iso?: string;
  aperture?: string;
  shutter_speed?: string;
  focal_length?: string;
  location?: string;
}

interface PhotoViewerProps {
  photoId: string;
  userId: number;
  onDelete?: (photoId: string) => void;
}

const PhotoViewer: React.FC<PhotoViewerProps> = ({ 
  photoId,
  userId,
  onDelete
}) => {
  const router = useRouter();
  
  // UI State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Photo data
  const [currentPhoto, setCurrentPhoto] = useState<PhotoData | null>(null);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [isNavigatingAfterFetch, setIsNavigatingAfterFetch] = useState(false);

  // Fetch all images with pagination
  const {
    data: imagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isImagesLoading,
    error: imagesError
  } = useImages(userId, 50); // Fetch more photos for better navigation

  // Flatten all pages into single array and memoize
  const allPhotos = useMemo(() => {
    return imagesData?.pages?.flatMap(page => page.photos) || [];
  }, [imagesData]);

  // Find current photo index
  const currentIndex = useMemo(() => {
    return allPhotos.findIndex(photo => photo.id === photoId);
  }, [allPhotos, photoId]);

  // This effect handles the navigation after new photos have been fetched.
  useEffect(() => {
    if (isNavigatingAfterFetch && !isFetchingNextPage) {
      setIsNavigatingAfterFetch(false); // Reset the trigger

      // `allPhotos` is now updated from the new render
      const nextPhoto = allPhotos[currentIndex + 1];
      if (nextPhoto) {
        router.push(`/photos/${nextPhoto.id}`);
      } else {
        toast.warn("You've reached the end of the photos.");
      }
    }
  }, [isNavigatingAfterFetch, isFetchingNextPage, allPhotos, currentIndex, router]);

  // Validate if current photo exists in our data
  const isValidPhoto = useMemo(() => {
    return currentIndex !== -1;
  }, [currentIndex]);

  // Navigation availability based on fetched data
  const canGoNext = useMemo(() => {
    if (!isValidPhoto) return false;
    // Show next button if there's a next photo in our fetched data OR if there are more pages to fetch
    return (currentIndex < allPhotos.length - 1) || hasNextPage;
  }, [isValidPhoto, currentIndex, allPhotos.length, hasNextPage]);

  const canGoPrevious = useMemo(() => {
    if (!isValidPhoto) return false;
    // Show previous button if there's a previous photo in our fetched data
    return currentIndex > 0;
  }, [isValidPhoto, currentIndex]);

  // Updated navigation handlers
  const handleNext = useCallback(() => {
    const localCurrentIndex = allPhotos.findIndex(p => p.id === photoId);

    // If the next photo is already in our list, navigate to it.
    if (localCurrentIndex < allPhotos.length - 1) {
      const nextPhoto = allPhotos[localCurrentIndex + 1];
      router.push(`/photos/${nextPhoto.id}`);
      return;
    }
    
    // If we are at the end of the list, but more pages are available...
    if (hasNextPage) {
      // If not already fetching, trigger a fetch.
      if (!isFetchingNextPage) {
        fetchNextPage();
        toast.info("Loading more photos...");
      }
      // Inform the user to click again. The proactive fetcher should minimize this.
      toast.info("Just a moment, please click 'next' again.");
    } else {
      toast.info("You've reached the end of the gallery.");
    }
  }, [allPhotos, photoId, hasNextPage, isFetchingNextPage, fetchNextPage, router]);

  const handlePrevious = useCallback(() => {
    // Simple - just go to previous photo in our fetched data
    if (currentIndex > 0) {
      const prevPhoto = allPhotos[currentIndex - 1];
      router.push(`/photos/${prevPhoto.id}`);
    }
  }, [currentIndex, allPhotos, router]);

  // Fetch current photo details only if it's valid
  const fetchCurrentPhoto = useCallback(async () => {
    if (!photoId || !isValidPhoto) return;
    
    setIsPhotoLoading(true);
    setPhotoError(null);
    
    try {
      // Get basic info from our validated list
      const photoFromList = allPhotos.find(p => p.id === photoId);
      
      if (photoFromList) {
        // Use validated data from list for immediate display
        const basicPhotoInfo: PhotoData = {
          ...photoFromList,
          original_filename: photoFromList.alt || `photo_${photoId}.jpg`,
        };
        setCurrentPhoto(basicPhotoInfo);
        
        // Then fetch full details from API
        try {
          const photoData = await getPhotoUrl(parseInt(photoId));
          const enhancedPhotoInfo: PhotoData = {
            ...basicPhotoInfo,
            image_url: photoData.url,
          };
          setCurrentPhoto(enhancedPhotoInfo);
        } catch (apiError) {
          // If API fails, stick with basic info from list
          console.warn('Failed to fetch enhanced photo details:', apiError);
          toast.warning('Using cached photo data');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load photo';
      setPhotoError(errorMessage);
      toast.error('Failed to load photo');
    } finally {
      setIsPhotoLoading(false);
    }
  }, [photoId, isValidPhoto, allPhotos]);

  // Effect to handle invalid photos
  useEffect(() => {
    if (!isImagesLoading && allPhotos.length > 0 && !isValidPhoto) {
      console.warn(`Photo ID ${photoId} not found in available photos`);
      
      // Redirect to the first available photo
      if (allPhotos[0]) {
        toast.info('Photo not found. Redirecting to available photo.');
        router.replace(`/photos/${allPhotos[0].id}`);
      } else {
        toast.error('No photos available');
        router.back();
      }
    }
  }, [isImagesLoading, allPhotos, isValidPhoto, photoId, router]);

  // Effect to fetch photo when photoId changes and is valid
  useEffect(() => {
    if (isValidPhoto) {
      fetchCurrentPhoto();
    }
  }, [fetchCurrentPhoto, isValidPhoto]);

  // Auto-fetch more photos when user is near the end
  useEffect(() => {
    // Start fetching next page when user is within 3 photos of the end
    if (isValidPhoto && 
        currentIndex >= allPhotos.length - 3 && 
        hasNextPage && 
        !isFetchingNextPage) {
      fetchNextPage().catch(console.error);
    }
  }, [isValidPhoto, currentIndex, allPhotos.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Keyboard shortcuts - only work with valid photos
  useEffect(() => {
    if (!isValidPhoto) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      const shortcuts = ['Escape', 'f', 'i', 'ArrowLeft', 'ArrowRight', '+', '=', '-', 'r'];
      if (shortcuts.includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case "Escape":
          if (isFullscreen) setIsFullscreen(false);
          else router.back();
          break;
        case "f": setIsFullscreen(prev => !prev); break;
        case "i": setShowInfo(prev => !prev); break;
        case "ArrowLeft": 
          if (canGoPrevious) handlePrevious(); 
          break;
        case "ArrowRight": 
          if (canGoNext && !isFetchingNextPage) handleNext(); 
          break;
        case "+": case "=": handleZoomIn(); break;
        case "-": handleZoomOut(); break;
        case "r": handleRotate(); break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isValidPhoto, isFullscreen, router, canGoPrevious, canGoNext, handlePrevious, handleNext]);

  // Optimized handlers
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!currentPhoto || !isValidPhoto) return;
    
    setIsDownloading(true);
    try {
      toast.info("Preparing download...");
      const blob = await fetchImageBlob(currentPhoto.image_url);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = currentPhoto.original_filename || `photo_${photoId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Download started!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download photo");
    } finally {
      setIsDownloading(false);
    }
  }, [currentPhoto, isValidPhoto, photoId]);

  const handleDelete = useCallback(async () => {
    if (!isValidPhoto) return;

    try {
      toast.info("Deleting photo...");
      await deletePhoto(parseInt(photoId));
      onDelete?.(photoId);
      toast.success("Photo deleted successfully!");
      
      // Navigate to next valid photo or go back
      if (currentIndex < allPhotos.length - 1) {
        const nextPhoto = allPhotos[currentIndex + 1];
        router.push(`/photos/${nextPhoto.id}`);
      } else if (currentIndex > 0) {
        const prevPhoto = allPhotos[currentIndex - 1];
        router.push(`/photos/${prevPhoto.id}`);
      } else {
        router.back();
      }
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete photo");
    }
    setShowDeleteConfirm(false);
  }, [isValidPhoto, photoId, onDelete, currentIndex, allPhotos, router]);

  const handleShare = useCallback(async () => {
    if (!currentPhoto || !isValidPhoto) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: currentPhoto?.alt,
          text: `Check out this photo: ${currentPhoto?.alt}`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  }, [currentPhoto, isValidPhoto]);

  // Loading state
  if (isImagesLoading || isPhotoLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading photos...</p>
        </div>
      </div>
    );
  }

  // Error state or invalid photo
  if (imagesError || photoError || !isValidPhoto || !currentPhoto) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">
            {imagesError?.message || photoError || `Photo ${photoId} not available`}
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => router.back()} 
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Go Back
            </button>
            {allPhotos.length > 0 && (
              <button 
                onClick={() => router.push(`/photos/${allPhotos[0].id}`)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                View Available Photos
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-black text-white`}>
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isFullscreen ? 'absolute top-0 left-0 right-0 z-10' : 'relative'} bg-gradient-to-b from-black/80 to-transparent p-4`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-semibold text-lg">{currentPhoto.alt}</h1>
              <p className="text-sm text-gray-400">
                {currentPhoto.original_filename} • {currentIndex + 1} of {allPhotos.length}
                {hasNextPage && (
                  <span className="text-blue-400"> (+ more available)</span>
                )}
                {isFetchingNextPage && (
                  <span className="text-yellow-400"> • Loading...</span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsLiked(!isLiked)} 
              className={`p-2 hover:bg-white/10 rounded-full transition-colors ${isLiked ? 'text-red-500' : 'text-white'}`}
            >
              <FiHeart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={handleShare} 
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <FiShare2 className="h-5 w-5" />
            </button>
            <button 
              onClick={handleDownload} 
              disabled={isDownloading} 
              className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
            >
              <FiDownload className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setShowInfo(!showInfo)} 
              className={`p-2 hover:bg-white/10 rounded-full transition-colors ${showInfo ? 'bg-white/20' : ''}`}
            >
              <FiInfo className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main content area */}
      <div className={`flex ${isFullscreen ? 'h-screen pt-16' : 'min-h-[calc(100vh-80px)]'}`}>
        {/* Image viewer */}
        <div className="flex-1 flex items-center justify-center p-4 relative">
          {/* Navigation buttons - show based on available data */}
          {canGoPrevious && (
            <button 
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors z-10"
            >
              <FiChevronLeft className="h-6 w-6" />
            </button>
          )}
          
          {canGoNext && (
            <button 
              onClick={handleNext}
              disabled={isFetchingNextPage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors z-10 disabled:opacity-50"
            >
              <FiChevronRight className="h-6 w-6" />
              {/* Show loading indicator when fetching more photos */}
              {isFetchingNextPage && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </button>
          )}

          {/* Image */}
          <motion.div 
            className="relative max-w-full max-h-full flex items-center justify-center"
            drag={zoom > 1}
            dragElastic={0.1}
            style={{ cursor: zoom > 1 ? 'grab' : 'default' }}
            whileDrag={{ cursor: 'grabbing' }}
          >
            <motion.div
              animate={{ scale: zoom, rotate: rotation }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="relative"
            >
              <Image
                src={currentPhoto.image_url}
                alt={currentPhoto.alt}
                width={1200}
                height={800}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                priority
                quality={90}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
            </motion.div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 rounded-full px-4 py-2 flex items-center gap-2"
          >
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="p-2 hover:bg-white/10 rounded-full disabled:opacity-50"
            >
              <FiZoomOut className="h-4 w-4" />
            </button>
            <span className="text-sm px-2">{Math.round(zoom * 100)}%</span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="p-2 hover:bg-white/10 rounded-full disabled:opacity-50"
            >
              <FiZoomIn className="h-4 w-4" />
            </button>
            <div className="w-px h-6 bg-gray-600 mx-2" />
            <button
              onClick={handleRotate}
              className="p-2 hover:bg-white/10 rounded-full"
            >
              <FiRotateCw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-white/10 rounded-full"
            >
              {isFullscreen ? <FiMinimize2 className="h-4 w-4" /> : <FiMaximize2 className="h-4 w-4" />}
            </button>
          </motion.div>
        </div>

        {/* Info sidebar */}
        <AnimatePresence>
          {showInfo && (
            <motion.aside
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-80 bg-gray-900 border-l border-gray-800 p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Photo Details</h2>
                <button
                  onClick={() => setShowInfo(false)}
                  className="p-1 hover:bg-gray-800 rounded"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">BASIC INFO</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Filename</span>
                      <span className="truncate ml-2">{currentPhoto.original_filename}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date</span>
                      <span>{currentPhoto.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Photo ID</span>
                      <span>{currentPhoto.id}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">ACTIONS</h3>
                  <div className="space-y-2">
                    <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition-colors">
                      <FiEdit3 className="h-4 w-4" />
                      <span>Edit Photo</span>
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-red-900/20 text-red-400 rounded-lg transition-colors"
                    >
                      <FiTrash2 className="h-4 w-4" />
                      <span>Delete Photo</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-lg p-6 max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-2">Delete Photo?</h3>
              <p className="text-gray-400 mb-6">
                This action cannot be undone. The photo will be permanently deleted.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Updated PhotoPage component
const PhotoPage = () => {
  const params = useParams();
  const photoId = params.id as string;
  
  // Replace with actual user ID from your auth context
  const userId = 1; // You'll need to get this from your auth system

  if (!photoId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-red-400">Photo ID is missing.</p>
      </div>
    );
  }

  return <PhotoViewer photoId={photoId} userId={userId} />;
};

export default PhotoPage;

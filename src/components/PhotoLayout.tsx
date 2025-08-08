"use client";

import React from "react";
import PortalMenu from "@/components/PortalMenu";
import { PhotoViewer } from "@/components/PhotoViewer"; // Import the fixed PhotoViewer
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  FiColumns,
  FiFilter,
  FiGrid,
  FiImage,
  FiList,
  FiMoreHorizontal,
  FiEye,
  FiSearch,
  FiUpload,
  FiDownload,
  FiTrash2,
} from "react-icons/fi";
import { useUploadGroupImages } from "@/api/upload";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { fetchImageBlob } from "@/api/images/images";
import JSZip from "jszip";
import { toast } from "react-toastify";
import { UseMutationResult } from "@tanstack/react-query";

interface Photo {
  id: string;
  image_url: string;
  alt: string;
  original_filename: string;
  date?: string;
  location?: string;
}

interface PhotoLayoutProps {
  photos: Photo[];
  groupId?: number | null;
  title?: string;
  deleteSingleMutation: UseMutationResult<void, Error, { photoId: number; groupId?: number }, unknown>;
  deleteBulkMutation: UseMutationResult<
    { success: number[]; failed: Array<{ id: number; error: string }> },
    Error,
    { photoIds: number[]; groupId?: number },
    unknown
  >;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}

const PhotoLayout: React.FC<PhotoLayoutProps> = ({ 
  photos = [], 
  groupId, 
  title = "Your Photos", 
  deleteBulkMutation, 
  deleteSingleMutation,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage 
}) => {
  const router = useRouter();
  
  const uploadMutation = useUploadGroupImages();
  const [viewMode, setViewMode] = useState<"grid" | "list" | "masonry">("masonry");
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [activeMenuPhoto, setActiveMenuPhoto] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // PhotoViewer state
  const [viewerPhoto, setViewerPhoto] = useState<Photo | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [likedPhotos, setLikedPhotos] = useState<string[]>([]);
  const [viewerDownloading, setViewerDownloading] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    if (groupId) {
      uploadMutation.mutate({ groupId, files: acceptedFiles });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, disabled: !groupId });

  useEffect(() => {
    setIsDesktop(window.innerWidth >= 768);
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const togglePhotoSelection = (id: string) => {
    if (isDesktop) {
      setSelectedPhotos((prev) =>
        prev.includes(id)
          ? prev.filter((photoId) => photoId !== id)
          : [...prev, id]
      );
    }
  };

  const toggleMobileMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuPhoto((prev) => (prev === id ? null : id));
  };

  // Handle viewing a single photo in the PhotoViewer
  const handleViewPhoto = (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const photoIndex = photos.findIndex(p => p.id === photoId);
    const photo = photos[photoIndex];
    
    if (photo && photoIndex !== -1) {
      setViewerPhoto(photo);
      setCurrentPhotoIndex(photoIndex);
    }
  };

  // PhotoViewer handlers
  const handleCloseViewer = () => {
    setViewerPhoto(null);
  };

  const handleNextPhoto = () => {
    if (currentPhotoIndex < photos.length - 1) {
      const nextIndex = currentPhotoIndex + 1;
      setCurrentPhotoIndex(nextIndex);
      setViewerPhoto(photos[nextIndex]);
    }
  };

  const handlePreviousPhoto = () => {
    if (currentPhotoIndex > 0) {
      const prevIndex = currentPhotoIndex - 1;
      setCurrentPhotoIndex(prevIndex);
      setViewerPhoto(photos[prevIndex]);
    }
  };

  const handleViewerDownload = async () => {
    if (!viewerPhoto) return;
    
    setViewerDownloading(true);
    try {
      const blob = await fetchImageBlob(viewerPhoto.image_url);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = viewerPhoto.original_filename || `photo_${viewerPhoto.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast.success("Download started!");
    } catch (error) {
      console.error("Failed to download photo:", error);
      toast.error("Failed to download photo");
    } finally {
      setViewerDownloading(false);
    }
  };

  const handleViewerLike = () => {
    if (!viewerPhoto) return;
    
    setLikedPhotos(prev => 
      prev.includes(viewerPhoto.id) 
        ? prev.filter(id => id !== viewerPhoto.id)
        : [...prev, viewerPhoto.id]
    );
  };

  const handleViewerShare = () => {
    if (!viewerPhoto) return;
    
    if (navigator.share) {
      navigator.share({
        title: viewerPhoto.alt || 'Photo',
        url: viewerPhoto.image_url
      });
    } else {
      navigator.clipboard.writeText(viewerPhoto.image_url);
      toast.success("Photo URL copied to clipboard!");
    }
  };

  const handleViewerDelete = async () => {
    if (!viewerPhoto) return;
    
    const confirmed = window.confirm("Are you sure you want to delete this photo? This action cannot be undone.");
    if (!confirmed) return;

    try {
      const id = parseInt(viewerPhoto.id);
      await deleteSingleMutation.mutateAsync({ 
        photoId: id, 
        groupId: groupId || undefined 
      });
      
      toast.success("Photo deleted successfully!");
      handleCloseViewer(); // Close the viewer after deletion
    } catch (error) {
      console.error("Failed to delete photo:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete photo");
    }
  };

  // Handle single photo deletion (mobile)
  const handleSinglePhotoDelete = async (photoId: string) => {
    try {
      const id = parseInt(photoId);
      
      toast.info("Deleting photo...");
      
      await deleteSingleMutation.mutateAsync({ 
        photoId: id, 
        groupId: groupId || undefined 
      });
      
      toast.success("Photo deleted successfully!");
    } catch (error) {
      console.error("Failed to delete photo:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete photo");
    }
  };

  // Updated mobile photo action handler
  const handlePhotoAction = (action: string, id: string) => {
    if (action === 'edit') {
      router.push(`/photo/${id}`);
    } else if (action === 'download') {
      handleSinglePhotoDownload(id);
    } else if (action === 'delete') {
      handleSinglePhotoDelete(id);
    }
    setActiveMenuPhoto(null);
  };

  // Handle bulk deletion (desktop)
  const handleBulkDelete = async () => {
    if (selectedPhotos.length === 0) {
      toast.error("No photos selected for deletion.");
      return;
    }

    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedPhotos.length} photo${selectedPhotos.length > 1 ? 's' : ''}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      toast.info(`Deleting ${selectedPhotos.length} photo${selectedPhotos.length > 1 ? 's' : ''}...`);
      
      const photoIds = selectedPhotos.map(id => parseInt(id));
      const result = await deleteBulkMutation.mutateAsync({ 
        photoIds, 
        groupId: groupId || undefined 
      });

      // Handle results
      if (result.success.length > 0) {
        toast.success(`Successfully deleted ${result.success.length} photo${result.success.length > 1 ? 's' : ''}!`);
      }

      if (result.failed.length > 0) {
        toast.error(`Failed to delete ${result.failed.length} photo${result.failed.length > 1 ? 's' : ''}. Please try again.`);
        
        // Log detailed errors for debugging
        result.failed.forEach(({ id, error }) => {
          console.error(`Failed to delete photo ${id}:`, error);
        });
      }

      // Clear selection regardless of partial failures
      setSelectedPhotos([]);

    } catch (error) {
      console.error("Bulk delete failed:", error);
      toast.error("An unexpected error occurred during deletion.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Separate function for single photo download
  const handleSinglePhotoDownload = async (photoId: string) => {
    setIsDownloading(true);
    
    try {
      toast.info("Preparing download...");
      const photo = photos.find(p => p.id === photoId);

      if (!photo) {
        toast.error(`Photo with ID ${photoId} not found.`);
        return;
      }

      const blob = await fetchImageBlob(photo.image_url);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = photo.original_filename || `photo_${photoId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      toast.success("Download started!");
    } catch (error) {
      console.error("Failed to download photo:", error);
      toast.error("An error occurred while downloading the photo.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEdit = () => {
    if (selectedPhotos.length === 1) {
      router.push(`/edit/${selectedPhotos[0]}`);
    }
  };

  const handleBulkDownload = async () => {
    const selectionCount = selectedPhotos.length;

    if (selectionCount === 0) {
      toast.error("No photos selected for download.");
      return;
    }

    setIsDownloading(true);

    try {
      // Handle single file download
      if (selectionCount === 1) {
        toast.info("Preparing download...");
        const photoId = selectedPhotos[0];
        const photo = photos.find(p => p.id === photoId);

        if (!photo) {
          toast.error(`Photo with ID ${photoId} not found.`);
          return;
        }

        const blob = await fetchImageBlob(photo.image_url);
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = photo.original_filename || `photo_${photoId}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        
        toast.success("Download started!");
        setSelectedPhotos([]);
        return;
      }

      // Handle bulk (zip) download
      toast.info(`Preparing ${selectionCount} photos for download...`);
      const zip = new JSZip();
      const downloadPromises: Promise<void>[] = [];
      const failedDownloads: string[] = [];

      // Create download promises for all selected photos
      selectedPhotos.forEach((photoId) => {
        const photo = photos.find(p => p.id === photoId);
        if (!photo) {
          failedDownloads.push(photoId);
          return;
        }

        const downloadPromise = fetchImageBlob(photo.image_url)
          .then((blob) => {
            const filename = photo.original_filename || `photo_${photoId}.jpg`;
            // Just sanitize invalid characters, let OS handle duplicates
            const sanitizedFilename = filename.replace(/[<>:"/\\|?*]/g, '_');
            zip.file(sanitizedFilename, blob);
          })
          .catch((error) => {
            console.error(`Failed to download photo ${photoId}:`, error);
            failedDownloads.push(photoId);
          });

        downloadPromises.push(downloadPromise);
      });

      // Wait for all downloads to complete
      await Promise.allSettled(downloadPromises);

      // Show warnings for failed downloads
      if (failedDownloads.length > 0) {
        toast.warning(`${failedDownloads.length} photos failed to download and were skipped.`);
      }

      // Check if we have any files to zip
      const fileCount = Object.keys(zip.files).length;
      if (fileCount === 0) {
        toast.error("No photos could be downloaded.");
        return;
      }

      // Generate and download the zip file (no compression to preserve quality)
      toast.info("Creating zip file...");
      const zipBlob = await zip.generateAsync({ 
        type: "blob",
        compression: "STORE" // No compression to preserve original quality
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipBlob);
      
      // Generate a more descriptive filename
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      link.download = `photos_${timestamp}_${fileCount}items.zip`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      const successCount = fileCount;
      const message = failedDownloads.length > 0 
        ? `Downloaded ${successCount} photos successfully. ${failedDownloads.length} failed.`
        : `Successfully downloaded ${successCount} photos!`;
      
      toast.success(message);
      setSelectedPhotos([]);

    } catch (error) {
      console.error("Bulk download failed:", error);
      toast.error("An error occurred during the download process.");
    } finally {
      setIsDownloading(false);
    }
  };

  const renderContent = () => {
    if (!photos || photos.length === 0) {
      return (
        <div {...getRootProps()} className="flex flex-col items-center justify-center h-64 bg-gray-800/50 rounded-lg p-8 text-center cursor-pointer border-2 border-dashed border-gray-600 hover:border-purple-500 transition-colors">
          <input {...getInputProps()} />
          <FiImage className="text-gray-400 text-6xl mb-4" />
          <h3 className="text-xl font-semibold text-gray-200">
            {groupId ? "This Group is Empty" : "Your Gallery is Empty"}
          </h3>
          {isDragActive ? (
            <p className="text-purple-400">Drop the files here ...</p>
          ) : (
            <p className="text-gray-400">
              {groupId ? "Drag 'n' drop some files here, or click to select files" : "Upload a photo to get started."}
            </p>
          )}
        </div>
      );
    }

    switch (viewMode) {
      case "grid":
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
                className={`group relative aspect-square rounded-xl overflow-hidden border-2 ${
                  selectedPhotos.includes(photo.id)
                    ? "border-purple-500"
                    : "border-transparent"
                }`}
                onClick={() => isDesktop && togglePhotoSelection(photo.id)}
              >
                <Image
                  src={photo.image_url}
                  alt={photo.alt || photo.original_filename}
                  fill
                  className="object-cover cursor-pointer"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
                
                {/* View Button - Shows on Hover (Top Left) */}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <motion.button
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileHover={{ scale: 1.1 }}
                    className="bg-white/90 hover:bg-white text-gray-900 p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    style={{ 
                      animation: "fadeInScale 0.2s ease-out 0.1s both"
                    }}
                    onClick={(e) => handleViewPhoto(photo.id, e)}
                  >
                    <FiEye className="h-4 w-4" />
                  </motion.button>
                </div>

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
        );
      case "list":
        return (
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
                className={`group flex items-center gap-4 p-3 rounded-lg cursor-pointer ${
                  selectedPhotos.includes(photo.id)
                    ? "bg-purple-500/20"
                    : "bg-gray-800/50 hover:bg-gray-800"
                }`}
                onClick={() => isDesktop && togglePhotoSelection(photo.id)}
              >
                <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
                  <Image
                    src={photo.image_url}
                    alt={photo.alt || photo.original_filename}
                    fill
                    className="object-cover"
                  />
                  
                  {/* View Button - Shows on Hover for List View (Top Left) */}
                  <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <motion.button
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileHover={{ scale: 1.1 }}
                      className="bg-white/90 hover:bg-white text-gray-900 p-1 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                      style={{ 
                        animation: "fadeInScale 0.2s ease-out 0.1s both"
                      }}
                      onClick={(e) => handleViewPhoto(photo.id, e)}
                    >
                      <FiEye className="h-2.5 w-2.5" />
                    </motion.button>
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium">{photo.alt}</h3>
                  <div className="flex gap-4 text-sm text-gray-400">
                    {photo.date && <span>{photo.date}</span>}
                    {photo.location && <span>{photo.location}</span>}
                  </div>
                </div>
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
        );
      case "masonry":
        return (
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
                className={`group relative break-inside-avoid rounded-xl overflow-hidden border-2 ${
                  selectedPhotos.includes(photo.id)
                    ? "border-purple-500"
                    : "border-transparent"
                }`}
                onClick={() => isDesktop && togglePhotoSelection(photo.id)}
              >
                <Image
                  src={photo.image_url}
                  alt={photo.alt || photo.original_filename}
                  width={500}
                  height={750}
                  className="w-full h-full object-cover cursor-pointer"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
                
                {/* View Button - Shows on Hover (Top Left) */}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <motion.button
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileHover={{ scale: 1.1 }}
                    className="bg-white/90 hover:bg-white text-gray-900 p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    style={{ 
                      animation: "fadeInScale 0.2s ease-out 0.1s both"
                    }}
                    onClick={(e) => handleViewPhoto(photo.id, e)}
                  >
                    <FiEye className="h-4 w-4" />
                  </motion.button>
                </div>

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
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-20">
      <style jsx>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
      
      {/* PhotoLayout Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>

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
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full flex items-center gap-2"
                disabled={!groupId}
              >
                <FiUpload /> {uploadMutation.isPending ? "Uploading..." : "Upload"}
              </motion.button>
            </div>
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

      {renderContent()}

      {hasNextPage && (
        <div className="mt-8 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchNextPage && fetchNextPage()}
            disabled={isFetchingNextPage}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-full text-lg transition-all disabled:opacity-50"
          >
            {isFetchingNextPage ? "Loading..." : "Load More"}
          </motion.button>
        </div>
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
          <button
            onClick={handleEdit}
            disabled={selectedPhotos.length !== 1}
            className="hover:text-purple-400 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            Edit
          </button>
          <button className="hover:text-purple-400">Share</button>
          <button 
            onClick={handleBulkDownload}
            disabled={isDownloading}
            className="hover:text-purple-400 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FiDownload />
            {isDownloading ? "Downloading..." : "Download"}
          </button>
          <button className="hover:text-purple-400">Add to Album</button>
          <button 
            onClick={handleBulkDelete}
            disabled={isDeleting || deleteBulkMutation.isPending}
            className="text-red-400 hover:text-red-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FiTrash2 />
            {isDeleting || deleteBulkMutation?.isPending ? "Deleting..." : "Delete"}
          </button>
        </motion.div>
      )}

      {/* PhotoViewer Component */}
      {viewerPhoto && (
        <PhotoViewer
          photo={viewerPhoto}
          allPhotosCount={photos.length}
          currentIndex={currentPhotoIndex}
          isLiked={likedPhotos.includes(viewerPhoto.id)}
          isDownloading={viewerDownloading}
          onClose={handleCloseViewer}
          onNext={handleNextPhoto}
          onPrevious={handlePreviousPhoto}
          onDelete={handleViewerDelete}
          onDownload={handleViewerDownload}
          onShare={handleViewerShare}
          onLike={handleViewerLike}
          onEdit={()=>router.push(`/edit/${viewerPhoto.id}`)}
        />
      )}
    </div>
  );
};

export default PhotoLayout;
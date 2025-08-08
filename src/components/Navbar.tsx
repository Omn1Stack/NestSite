"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaMagic, FaMoon, FaSun } from "react-icons/fa";
import {
  FiImage,
  FiMenu,
  FiSearch,
  FiUpload,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { SearchModal } from "@/components/SearchModal";
import { PhotoViewer } from "@/components/PhotoViewer";
import { photoType } from "@/types/photosType";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  
  // PhotoViewer state
  const [selectedPhoto, setSelectedPhoto] = useState<photoType | null>(null);
  const [allPhotos, setAllPhotos] = useState<photoType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Initialize theme from localStorage and set up effect to apply theme changes
  useEffect(() => {
    // Check if user has a saved preference
    const savedTheme = window.localStorage?.getItem("theme");
    const prefersDark = window.matchMedia?.(
      "(prefers-color-scheme: dark)"
    ).matches;

    // Set initial state based on saved preference or system preference
    setDarkMode(savedTheme ? savedTheme === "dark" : prefersDark);
  }, []);

  // Effect to apply theme changes to document and save to localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      window.localStorage?.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      window.localStorage?.setItem("theme", "light");
    }
  }, [darkMode]);

  // Toggle theme function
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Search functionality
  const handleSearchClick = () => {
    setSearchModalOpen(true); // Directly open the search modal
  };

  const handleSearchModalClose = () => {
    setSearchModalOpen(false);
    setSearchQuery(""); // Clear search query when modal closes
  };

  const handleImageSelect = (photo: photoType, photos: photoType[], index: number) => {
    setSelectedPhoto(photo);
    setAllPhotos(photos);
    setCurrentIndex(index);
    setIsPhotoViewerOpen(true);
    setSearchModalOpen(false); // Close search modal when image is selected
  };

  // PhotoViewer handlers
  const handlePhotoViewerClose = () => {
    setIsPhotoViewerOpen(false);
    setSelectedPhoto(null);
  };

  const handleNext = () => {
    if (currentIndex < allPhotos.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setSelectedPhoto(allPhotos[nextIndex]);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setSelectedPhoto(allPhotos[prevIndex]);
    }
  };

  const handleDelete = () => {
    console.log("Delete photo:", selectedPhoto?.id);
    // Implement delete functionality
  };

  const handleDownload = async () => {
    if (!selectedPhoto) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(selectedPhoto.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = selectedPhoto.alt || 'image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!selectedPhoto) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedPhoto.alt,
          url: selectedPhoto.image_url,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(selectedPhoto.image_url);
        // You could add a toast notification here
        console.log('URL copied to clipboard');
      } catch (error) {
        console.error('Copy failed:', error);
      }
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // Implement like functionality
    console.log("Like photo:", selectedPhoto?.id);
  };

  const handleEdit = () => {
    console.log("Edit photo:", selectedPhoto?.id);
    // Implement edit functionality
  };

  return (
    <>
      <nav className="bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 fixed w-full z-50 sm:w-full transition-colors duration-300">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:container lg:px-8">
          <div className="flex items-center justify-between h-16 relative">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-shrink-0 flex items-center"
            >
              <Link href="/" className="flex items-center">
                <FiImage className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                  Nest
                  <span className="text-purple-600 dark:text-purple-400">.</span>
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-8">
                <Link
                  href="/gallery"
                  className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center"
                >
                  <FiImage className="mr-2" /> Gallery
                </Link>
                <Link
                  href="/upload"
                  className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center"
                >
                  <FiUpload className="mr-2" /> Upload
                </Link>
                <Link
                  href="/groups"
                  className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center"
                >
                  <FiUsers className="mr-2" /> Groups
                </Link>
                <Link
                  href="/aitools"
                  className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center"
                >
                  <FaMagic className="mr-2" /> AI Tools
                </Link>
              </div>
            </div>

            {/* Search, Theme Toggle, and User Actions (Desktop) */}
            <div className="hidden md:flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSearchClick}
                className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 focus:outline-none"
              >
                <FiSearch className="h-5 w-5" />
              </motion.button>

              {/* Theme Toggle Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 focus:outline-none"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <FaSun className="h-5 w-5 text-yellow-400" />
                ) : (
                  <FaMoon className="h-5 w-5 text-blue-700" />
                )}
              </motion.button>

              <Link
                href="/account"
                className="flex items-center text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center border border-purple-200 dark:border-purple-400/30">
                  <FiUser className="text-purple-600 dark:text-purple-400" />
                </div>
              </Link>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="ml-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-all"
              >
                Upgrade
              </motion.button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Theme Toggle Button (Mobile) */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 focus:outline-none"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <FaSun className="h-5 w-5 text-yellow-400" />
                ) : (
                  <FaMoon className="h-5 w-5 text-blue-700" />
                )}
              </button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none"
              >
                {isOpen ? (
                  <FiX className="h-6 w-6" />
                ) : (
                  <FiMenu className="h-6 w-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/95 dark:bg-gray-900/95 transition-colors duration-300">
                <Link
                  href="/gallery"
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400 block px-3 py-2 rounded-md text-base font-medium flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <FiImage className="mr-2" /> Gallery
                </Link>
                <Link
                  href="/upload"
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400 block px-3 py-2 rounded-md text-base font-medium flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <FiUpload className="mr-2" /> Upload
                </Link>
                <Link
                  href="/groups"
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400 block px-3 py-2 rounded-md text-base font-medium flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <FiUsers className="mr-2" /> Groups
                </Link>
                <Link
                  href="/aitools"
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400 block px-3 py-2 rounded-md text-base font-medium flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <FaMagic className="mr-2" /> AI Tools
                </Link>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  {/* Mobile Search Button */}
                  <button
                    onClick={handleSearchClick}
                    className="w-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 rounded-md text-base font-medium flex items-center"
                  >
                    <FiSearch className="mr-2" /> Search Images
                  </button>
                  <Link
                    href="/account"
                    className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400 block px-3 py-2 rounded-md text-base font-medium flex items-center"
                    onClick={() => setIsOpen(false)}
                  >
                    <FiUser className="mr-2" /> Account
                  </Link>
                  <button className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-base font-medium">
                    Upgrade
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Bar (Animated) - REMOVED */}
      </nav>

      {/* Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={handleSearchModalClose}
        onImageSelect={handleImageSelect}
        initialQuery={searchQuery}
      />

      {/* Photo Viewer */}
      {isPhotoViewerOpen && selectedPhoto && (
        <PhotoViewer
          photo={selectedPhoto}
          allPhotosCount={allPhotos.length}
          currentIndex={currentIndex}
          isLiked={isLiked}
          isDownloading={isDownloading}
          onClose={handlePhotoViewerClose}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onDelete={handleDelete}
          onDownload={handleDownload}
          onShare={handleShare}
          onLike={handleLike}
          onEdit={handleEdit}
        />
      )}
    </>
  );
};

export default Navbar;
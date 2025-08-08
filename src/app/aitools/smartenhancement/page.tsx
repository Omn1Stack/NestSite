"use client";
import { useAiEnhancement } from "@/api/aifeature";
import { duplicatePhoto, getPhotoUrl, replacePhoto } from "@/api/images/images";
import { useImages } from "@/api/images/images";
import Spinner from "@/components/Spinner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  memo,
} from "react";
import ImageSelectionModal from "@/components/ImageSelectionModal";
import {
  FiCamera,
  FiEye,
  FiImage,
  FiMoon,
  FiRefreshCw,
  FiSave,
  FiStar,
  FiSun,
  FiUser,
  FiX,
  FiZap,
} from "react-icons/fi";
import { toast } from "react-toastify";

const ActionButton = ({
  icon,
  label,
  onClick,
  disabled = false,
  variant = "primary",
  onMouseEnter,
  onMouseLeave,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "success" | "danger" | "premium";
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
}) => {
  const baseClasses =
    "flex items-center justify-center gap-3 w-full font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]";
  const variantClasses = {
    primary:
      "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/25",
    secondary:
      "bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white shadow-lg",
    success:
      "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25",
    danger:
      "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/25",
    premium:
      "bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 hover:from-yellow-500 hover:via-orange-500 hover:to-red-500 text-white shadow-xl shadow-orange-500/30 border border-orange-400/20",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
};

const EditSection = ({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`p-5 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-700/50 ${className}`}
  >
    <h3 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">
      {title}
    </h3>
    {children}
  </div>
);

const EnhancementFilterButton = ({
  onClick,
  label,
  icon,
  isActive,
  disabled,
}: {
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  disabled: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] ${
      isActive
        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25 border border-purple-400/20"
        : "hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-600/50 text-gray-300 border border-gray-700/30 hover:border-gray-600/50"
    } ${disabled && "opacity-50 cursor-not-allowed hover:scale-100"}`}
  >
    <span className={`text-lg ${isActive ? "text-white" : "text-purple-400"}`}>
      {icon}
    </span>
    <span className="font-medium">{label}</span>
  </button>
);

const ImageDisplay = ({
  photo,
  isEnhancing,
  displayUrl,
  isComparing,
  onSelectPhotoClick,
}: {
  photo: any | null;
  isEnhancing: boolean;
  displayUrl: string | null;
  isComparing: boolean;
  onSelectPhotoClick: () => void;
}) => (
  <div className="xl:col-span-3 relative">
    <div className="bg-gradient-to-br from-black/30 to-gray-900/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 flex items-center justify-center p-6 h-[70vh] overflow-hidden">
      <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-purple-500 to-blue-500"></div>

      {isEnhancing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-sm z-20 rounded-2xl transition-opacity duration-300">
          <Spinner />
          <p className="text-xl font-semibold mt-4 text-white">
            Enhancing your photo...
          </p>
          <p className="text-gray-400">This may take a moment.</p>
        </div>
      )}

      {displayUrl ? (
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={displayUrl}
            alt={photo ? `Photo ${photo.id}` : "Selected photo"}
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
          />
          {photo && !isEnhancing && displayUrl !== photo.originalUrl && (
            <div
              className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold shadow-lg ${
                isComparing
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                  : "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
              }`}
            >
              {isComparing ? "Original" : "✨ Enhanced"}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-400 relative z-10">
          <FiImage className="h-24 w-24 mx-auto text-gray-600 mb-4" />
          <p className="text-2xl font-semibold mb-2">Ready to enhance?</p>
          <p className="text-lg">Select a photo to get started.</p>
        </div>
      )}
    </div>
    <button
      onClick={onSelectPhotoClick}
      className="absolute top-4 right-4 p-3 bg-gray-800/50 rounded-lg hover:bg-purple-600/50 transition-colors border border-gray-700 z-30"
      aria-label="Change photo"
    >
      <FiCamera className="h-5 w-5" />
    </button>
  </div>
);

// --- Main Page Component ---

const SmartEnhancementPage = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  // State Management
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [enhancedBlob, setEnhancedBlob] = useState<Blob | null>(null);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(true); // Open by default
  const [isComparing, setIsComparing] = useState(false);
  const [selectedEnhancement, setSelectedEnhancement] = useState<string | null>(
    "auto"
  );

  // API Hooks
  const { mutate: enhance, isPending: isEnhancing } = useAiEnhancement();
  const onSaveSuccess = (data: any) => {
    toast.success(data.message || "Photo saved successfully!");
    queryClient.invalidateQueries({ queryKey: ["usersImages"] });
    const newId = data.new_file_id || selectedPhoto?.id;
    if (newId) {
      router.push(`/photo/${newId}`);
    }
    setEnhancedBlob(null);
  };
  const onSaveError = (error: Error) => {
    toast.error(error.message || "An unexpected error occurred.");
  };
  const replaceMutation = useMutation({
    mutationFn: () => {
      if (!enhancedBlob || !selectedPhoto)
        throw new Error("No enhanced image to save.");
      return replacePhoto(selectedPhoto.id, enhancedBlob);
    },
    onSuccess: onSaveSuccess,
    onError: onSaveError,
  });
  const duplicateMutation = useMutation({
    mutationFn: () => {
      if (!enhancedBlob || !selectedPhoto)
        throw new Error("No enhanced image to save.");
      return duplicatePhoto(selectedPhoto.id, enhancedBlob);
    },
    onSuccess: onSaveSuccess,
    onError: onSaveError,
  });

  // Memoized values
  const displayUrl = useMemo(() => {
    if (!selectedPhoto) return null;
    if (isComparing) return selectedPhoto.originalUrl;
    return enhancedUrl || selectedPhoto.originalUrl;
  }, [selectedPhoto, enhancedUrl, isComparing]);

  // Callbacks
  const handleSelectPhoto = useCallback(async (photo: any) => {
    setIsModalOpen(false);
    setEnhancedBlob(null);
    setEnhancedUrl(null);
    setSelectedEnhancement("auto");

    try {
      const urlData = await getPhotoUrl(photo.id);
      setSelectedPhoto({ ...photo, originalUrl: urlData.url });
    } catch (error) {
      toast.error("Failed to load photo.");
      console.error(error);
    }
  }, []);

  const handleStartEnhancement = useCallback(() => {
    if (!selectedPhoto || !selectedEnhancement || isEnhancing) return;

    enhance(
      { photoId: selectedPhoto.id, enhancementMode: selectedEnhancement },
      {
        onSuccess: (blob) => {
          setEnhancedBlob(blob);
          setEnhancedUrl(URL.createObjectURL(blob));
        },
        onError: (error) => {
          toast.error(`Enhancement failed: ${error.message}`);
        },
      }
    );
  }, [selectedPhoto, selectedEnhancement, isEnhancing, enhance]);

  // Effects
  useEffect(() => {
    // Cleanup blob URL
    return () => {
      if (enhancedUrl) {
        URL.revokeObjectURL(enhancedUrl);
      }
    };
  }, [enhancedUrl]);

  const enhancementOptions = [
    { id: "auto", label: "Auto Enhance", icon: <FiZap /> },
    { id: "portrait", label: "Portrait Mode", icon: <FiUser /> },
    { id: "landscape", label: "Landscape", icon: <FiImage /> },
    { id: "low_light", label: "Low Light", icon: <FiMoon /> },
    { id: "vibrant", label: "Vibrant", icon: <FiSun /> },
    { id: "natural", label: "Natural", icon: <FiEye /> },
    { id: "professional", label: "Professional", icon: <FiCamera /> },
    { id: "artistic", label: "Artistic", icon: <FiStar /> },
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 text-white pt-20">
        <div className="container mx-auto px-4 mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
            AI Photo Enhancement
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Transform your photos with cutting-edge AI technology
          </p>
        </div>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
            <ImageDisplay
              photo={selectedPhoto}
              isEnhancing={isEnhancing}
              displayUrl={displayUrl}
              isComparing={isComparing}
              onSelectPhotoClick={() => setIsModalOpen(true)}
            />

            <div className="xl:col-span-2 space-y-6">
              {selectedPhoto && (
                <>
                  <EditSection
                    title="Save Your Work"
                    className="border-green-500/20"
                  >
                    {enhancedBlob ? (
                      <div className="grid grid-cols-2 gap-4">
                        <ActionButton
                          icon={<FiSave />}
                          label="Replace Original"
                          onClick={() => replaceMutation.mutate()}
                          disabled={
                            replaceMutation.isPending || duplicateMutation.isPending
                          }
                          variant="success"
                        />
                        <ActionButton
                          icon={<FiRefreshCw />}
                          label="Save as New"
                          onClick={() => duplicateMutation.mutate()}
                          disabled={
                            replaceMutation.isPending || duplicateMutation.isPending
                          }
                          variant="danger"
                        />
                      </div>
                    ) : (
                      <div className="text-center p-4 border-2 border-dashed border-gray-600 rounded-xl h-full flex flex-col justify-center items-center">
                        <FiSave className="h-10 w-10 mx-auto text-gray-500 mb-2" />
                        <p className="text-sm text-gray-400">
                          Apply an enhancement to save.
                        </p>
                      </div>
                    )}
                  </EditSection>

                  <EditSection
                    title="Enhancement Styles"
                    className="border-purple-500/20"
                  >
                    <div className="max-h-48 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800">
                      {enhancementOptions.map((opt) => (
                        <EnhancementFilterButton
                          key={opt.id}
                          label={opt.label}
                          icon={opt.icon}
                          onClick={() => setSelectedEnhancement(opt.id)}
                          isActive={selectedEnhancement === opt.id}
                          disabled={isEnhancing}
                        />
                      ))}
                    </div>
                    <div className="mt-6">
                      <ActionButton
                        icon={
                          isEnhancing ? (
                            <FiRefreshCw className="animate-spin" />
                          ) : (
                            <FiZap />
                          )
                        }
                        label={
                          isEnhancing ? "Enhancing..." : "✨ Start Enhancing"
                        }
                        onClick={handleStartEnhancement}
                        disabled={isEnhancing || !selectedEnhancement}
                        variant="premium"
                      />
                      
                      {enhancedUrl && (
                        <div className="mt-4">
                          <ActionButton
                            icon={<FiEye />}
                            label={
                              isComparing
                                ? "👀 Showing Original"
                                : "🔍 Compare with Original"
                            }
                            onClick={() => {}}
                            variant="secondary"
                            onMouseEnter={() => setIsComparing(true)}
                            onMouseLeave={() => setIsComparing(false)}
                          />
                          <p className="text-xs text-gray-400 mt-2 text-center">
                            Hover over the button to see the original photo.
                          </p>
                        </div>
                      )}
                    </div>
                  </EditSection>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <ImageSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelectPhoto}
      />
    </>
  );
};

export default SmartEnhancementPage;
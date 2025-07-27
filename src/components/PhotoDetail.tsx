"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiRotateCw, FiCrop, FiX, FiSave } from "react-icons/fi";
import { getPhotoUrl, rotatePhoto, cropPhoto, replacePhoto, duplicatePhoto } from "@/api/images/images";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

// --- Helper Components ---
const EditSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="p-4 bg-gray-800/50 rounded-lg">
    <h3 className="text-sm font-semibold text-gray-400 mb-3">{title}</h3>
    {children}
  </div>
);

const ActionButton = ({
  icon,
  label,
  onClick,
  disabled = false,
  variant = "primary",
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "success" | "danger";
}) => {
  const baseClasses = "flex items-center justify-center gap-2 w-full font-semibold py-2 px-4 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses = {
    primary: "bg-purple-600 hover:bg-purple-700 text-white",
    secondary: "bg-gray-700 hover:bg-gray-600 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
    danger: "bg-blue-600 hover:bg-blue-700 text-white",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseClasses} ${variantClasses[variant]}`}>
      {icon}
      <span>{label}</span>
    </button>
  );
};

// --- Main Component ---
type PhotoDetailProps = {
  photoId: number;
};

const PhotoDetail = ({ photoId }: PhotoDetailProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const [lastBlob, setLastBlob] = useState<Blob | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [isCropping, setIsCropping] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["photo", photoId],
    queryFn: () => getPhotoUrl(photoId),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data?.url) {
      setOriginalImageUrl(data.url);
      setDisplayUrl(data.url);
    }
  }, [data]);

  const handleMutationSuccess = (blob: Blob) => {
    if (displayUrl && displayUrl.startsWith("blob:")) {
      URL.revokeObjectURL(displayUrl);
    }
    const newUrl = URL.createObjectURL(blob);
    setDisplayUrl(newUrl);
    setLastBlob(blob);
    setHasChanges(true);
    setIsCropping(false);
    setIsRotating(false);
    setRotation(0);
  };

  const handleMutationError = (error: Error) => {
    toast.error(error.message || "An unexpected error occurred.");
  };

  const rotateMutation = useMutation({
    mutationFn: (angle: number) => rotatePhoto(photoId, angle),
    onSuccess: handleMutationSuccess,
    onError: handleMutationError,
  });

  const cropMutation = useMutation({
    mutationFn: (currentCrop: Crop) => {
      if (!imgRef.current) throw new Error("Image reference is not available");
      return cropPhoto(photoId, currentCrop, imgRef.current);
    },
    onSuccess: handleMutationSuccess,
    onError: handleMutationError,
  });

  const onSaveSuccess = (data: any) => {
    toast.success(data.message);
    queryClient.invalidateQueries({ queryKey: ["photos"] });
    const newId = data.new_file_id || photoId;
    if (router.asPath !== `/photo/${newId}`) {
        router.push(`/photo/${newId}`);
    }
    setLastBlob(null);
    setHasChanges(false);
  };

  const replaceMutation = useMutation({
    mutationFn: () => {
        if (!lastBlob) throw new Error("No edited image to save.");
        return replacePhoto(photoId, lastBlob);
    },
    onSuccess: onSaveSuccess,
    onError: handleMutationError,
  });

  const duplicateMutation = useMutation({
    mutationFn: () => {
        if (!lastBlob) throw new Error("No edited image to save.");
        return duplicatePhoto(photoId, lastBlob);
    },
    onSuccess: onSaveSuccess,
    onError: handleMutationError,
  });

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(makeAspectCrop({ unit: "%", width: 50 }, 16 / 9, width, height), width, height);
    setCrop(initialCrop);
  }

  const handleApplyCrop = () => {
    if (isCropping && crop) cropMutation.mutate(crop);
  };

  const handleApplyRotation = () => {
    if (isRotating) rotateMutation.mutate(rotation);
  };

  const cancelEditing = () => {
    setIsCropping(false);
    setIsRotating(false);
    setRotation(0);
  };

  const isProcessing = isLoading || rotateMutation.isPending || cropMutation.isPending || replaceMutation.isPending || duplicateMutation.isPending;
  const isEditing = isCropping || isRotating;

  if (isLoading) return <div className="text-center p-10 pt-24">Loading image...</div>;
  if (isError) return <div className="text-center p-10 pt-24 text-red-500">Error: {error.message}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Display Area */}
          <div className="lg:col-span-2 bg-black/20 rounded-lg flex items-center justify-center p-4 min-h-[60vh]">
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
                <p>Processing...</p>
              </div>
            )}
            {originalImageUrl && (
              isCropping ? (
                <ReactCrop crop={crop} onChange={c => setCrop(c)} aspect={16 / 9}>
                  <img ref={imgRef} src={originalImageUrl} alt="Crop me" onLoad={onImageLoad} className="max-w-full max-h-[80vh] object-contain" />
                </ReactCrop>
              ) : (
                <img src={displayUrl ?? ""} alt={`Photo ${photoId}`} className="max-w-full max-h-[80vh] object-contain transition-transform duration-300" style={{ transform: `rotate(${isRotating ? rotation : 0}deg)` }} />
              )
            )}
          </div>

          {/* Editing Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-4 bg-gray-800 rounded-lg">
              <h2 className="text-xl font-bold text-white mb-4">Edit Photo</h2>
              {hasChanges && lastBlob ? (
                <div className="space-y-3">
                  <ActionButton 
                    icon={<FiSave />} 
                    label="Save (Replace)" 
                    onClick={() => replaceMutation.mutate()} 
                    disabled={isProcessing} 
                    variant="success" 
                  />
                  <ActionButton 
                    icon={<FiSave />} 
                    label="Save as New" 
                    onClick={() => duplicateMutation.mutate()} 
                    disabled={isProcessing} 
                    variant="danger" 
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-400">Apply a rotation or crop to enable saving.</p>
              )}
            </div>

            {/* Rotate Section */}
            <EditSection title="Rotate">
              {!isRotating ? (
                <ActionButton icon={<FiRotateCw />} label="Rotate" onClick={() => { setIsRotating(true); setIsCropping(false); }} disabled={isProcessing || isEditing} />
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label htmlFor="rotation" className="font-medium text-sm">Angle</label>
                    <span className="text-purple-400 font-mono bg-gray-700 px-2 py-1 rounded-md text-sm">{rotation}°</span>
                  </div>
                  <input id="rotation" type="range" min="-180" max="180" value={rotation} onChange={(e) => setRotation(parseInt(e.target.value, 10))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" disabled={isProcessing} />
                  <ActionButton icon={<FiRotateCw />} label="Apply Rotation" onClick={handleApplyRotation} disabled={isProcessing || rotation === 0} />
                </div>
              )}
            </EditSection>

            {/* Crop Section */}
            <EditSection title="Crop">
              {!isCropping ? (
                <ActionButton icon={<FiCrop />} label="Crop" onClick={() => { setIsCropping(true); setIsRotating(false); }} disabled={isProcessing || isEditing} />
              ) : (
                <div className="space-y-4">
                    <p className="text-xs text-gray-400">Adjust the selection on the image.</p>
                    <ActionButton icon={<FiCrop />} label="Apply Crop" onClick={handleApplyCrop} disabled={isProcessing || !crop?.width || !crop?.height} />
                </div>
              )}
            </EditSection>
            
            {isEditing && (
                <ActionButton icon={<FiX />} label="Cancel" onClick={cancelEditing} variant="secondary" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoDetail;
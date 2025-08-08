"use client";
import { useUploadUserImages } from "@/api/upload";
import React, { useState, useCallback} from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { FiUploadCloud, FiX, FiCheckCircle, FiImage, FiAlertCircle } from "react-icons/fi";
import { toast } from "react-toastify";

const Upload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const { mutate: upload, isPending: isLoading, isSuccess, isError, error } = useUploadUserImages();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".png", ".jpg", ".webp"] },
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length > 0) {
      toast.info(`Uploading ${files.length} file(s)...`);
      try {
        await upload(files, {
          onSuccess: () => {
            toast.success("Upload successful!");
            setFiles([]);
          },
          onError: (err) => {
            toast.error(err instanceof Error ? err.message : "Upload failed");
          }
        });
      } catch (err) {
        // This catch block might be redundant if onError is handled, but good for safety
        console.error("Upload failed:", err);
        toast.error(err instanceof Error ? err.message : "An unexpected error occurred");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900/30 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-800/50 mt-10">
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Upload Photos
          </h1>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all 
              ${
                isDragActive
                  ? "border-purple-500 bg-purple-900/20"
                  : "border-gray-700 hover:border-purple-400"
              }`}
          >
            <input {...getInputProps()} />

            <div className="space-y-4">
              <div className="flex justify-center">
                <FiUploadCloud className="h-12 w-12 text-purple-400" />
              </div>

              {isDragActive ? (
                <p className="text-purple-300">Drop photos here</p>
              ) : (
                <>
                  <p className="text-gray-300">
                    Drag & drop photos here, or{" "}
                    <span className="text-purple-400 cursor-pointer">
                      browse
                    </span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Supported formats: JPEG, PNG, WEBP (Max 10MB)
                  </p>
                </>
              )}
            </div>
          </div>

          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="relative group aspect-square rounded-xl overflow-hidden"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 p-1 bg-gray-900/80 rounded-full hover:bg-red-500/80 transition-colors"
                    >
                      <FiX className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>

              {!isLoading && !isSuccess && (
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleUpload}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all"
                  >
                    <FiUploadCloud className="h-5 w-5" />
                    Upload {files.length} photos
                  </button>
                  <button
                    onClick={() => setFiles([])}
                    className="text-gray-300 hover:text-gray-100 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {isLoading && (
             <div className="space-y-4 mt-6">
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-purple-500"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
               <div className="flex items-center gap-2 text-purple-400">
                 <FiImage className="h-5 w-5 animate-pulse" />
                 <span>Uploading {files.length} photos...</span>
               </div>
             </div>
          )}

          {isSuccess && (
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="mt-6 p-4 bg-green-900/20 rounded-lg flex items-center gap-3"
            >
              <FiCheckCircle className="h-6 w-6 text-green-400" />
              <div>
                <p className="text-green-400 font-medium">Upload complete!</p>
                <p className="text-green-300 text-sm">
                  Your photos have been successfully uploaded.
                </p>
              </div>
            </motion.div>
          )}

          {isError && (
             <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="mt-6 p-4 bg-red-900/20 rounded-lg flex items-center gap-3"
            >
              <FiAlertCircle className="h-6 w-6 text-red-400" />
              <div>
                <p className="text-red-400 font-medium">Upload Failed</p>
                <p className="text-red-300 text-sm">
                  {error?.message || "An unknown error occurred."}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Upload;
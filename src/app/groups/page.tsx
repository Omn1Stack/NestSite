"use client";
import PhotoLayout from "@/components/PhotoLayout";
import { useCreateGroup, useGetGroups, useGetGroupImages, deleteGroupPhoto, deleteMultipleGroupPhotos } from "@/api/groups";
import { useUploadGroupImages } from "@/api/upload";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiX, FiLoader, FiAlertTriangle, FiSearch, FiGrid } from "react-icons/fi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { fetchImageBlob } from "@/api/images/images";
import JSZip from "jszip";
import { useRouter } from "next/navigation";
import useIsDesktop from "@/hooks/useIsDesktop";
import GroupListPanel from "@/components/GroupListPanel";

// Define the Group interface based on your API response
interface Group {
  id: number;
  name: string;
  description?: string;
  role: string;
  photocount?: number;
}

const GroupPhotoLoader = ({ groupId }: { groupId: number }) => {
  const { data: photos, isLoading, isError, error } = useGetGroupImages(groupId);
  const queryClient = useQueryClient();
  const router = useRouter();

  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const uploadMutation = useUploadGroupImages();

  const deleteSingleMutationHook = useMutation({
    mutationFn: async ({ photoId }: { photoId: number }) => {
      await deleteGroupPhoto(photoId, groupId);
    },
    onSuccess: () => {
      toast.success("Photo deleted successfully from group!");
      queryClient.invalidateQueries({ queryKey: ["groupImages", groupId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete photo.");
    },
  });

  const deleteBulkMutationHook = useMutation({
    mutationFn: async ({ photoIds }: { photoIds: number[] }) => {
      return await deleteMultipleGroupPhotos(photoIds, groupId);
    },
    onSuccess: (result) => {
      if (result.success.length > 0) {
        toast.success(
          `Successfully deleted ${result.success.length} photo(s)!`
        );
      }
      if (result.failed.length > 0) {
        toast.error(`Failed to delete ${result.failed.length} photo(s).`);
      }
      queryClient.invalidateQueries({ queryKey: ["groupImages", groupId] });
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "An unexpected error occurred during deletion."
      );
    },
  });

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return;

    toast.info(`Uploading ${files.length} file(s) to group...`);
    try {
      await uploadMutation.mutateAsync({ groupId, files });
      toast.success("Upload successful!");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(error instanceof Error ? error.message : "Upload failed");
    }
  };

  const handleSingleDelete = async (photoId: string) => {
    const id = parseInt(photoId, 10);
    setIsDeleting(true);
    await deleteSingleMutationHook.mutateAsync({ photoId: id });
    setIsDeleting(false);
  };

  const handleBulkDelete = async (photoIds: string[]) => {
    if (photoIds.length === 0) {
      toast.error("No photos selected for deletion.");
      return;
    }
    setIsDeleting(true);
    const ids = photoIds.map((id) => parseInt(id, 10));
    await deleteBulkMutationHook.mutateAsync({ photoIds: ids });
    setIsDeleting(false);
  };

  const handleSingleDownload = async (photoId: string) => {
    setIsDownloading(true);
    try {
      toast.info("Preparing download...");
      const photo = photos?.find((p: any) => p.id.toString() === photoId);
      if (!photo) {
        throw new Error(`Photo with ID ${photoId} not found.`);
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
    } catch (err) {
      const error = err as Error;
      console.error("Failed to download photo:", error);
      toast.error(
        error.message || "An error occurred while downloading the photo."
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBulkDownload = async (photoIds: string[]) => {
    const selectionCount = photoIds.length;
    if (selectionCount === 0) {
      toast.error("No photos selected for download.");
      return;
    }
    setIsDownloading(true);
    try {
      if (selectionCount === 1) {
        await handleSingleDownload(photoIds[0]);
        return;
      }
      toast.info(`Preparing ${selectionCount} photos for download...`);
      const zip = new JSZip();
      const downloadPromises = photoIds.map((photoId) => {
        const photo = photos?.find((p: any) => p.id.toString() === photoId);
        if (photo) {
          return fetchImageBlob(photo.image_url)
            .then((blob) => {
              const filename =
                photo.original_filename || `photo_${photoId}.jpg`;
              const sanitizedFilename = filename.replace(
                /[<>:"/\\|?*]/g,
                "_"
              );
              zip.file(sanitizedFilename, blob);
            })
            .catch((error) => {
              console.error(`Failed to download photo ${photoId}:`, error);
            });
        }
        return Promise.resolve();
      });
      await Promise.allSettled(downloadPromises);
      const fileCount = Object.keys(zip.files).length;
      if (fileCount === 0) {
        throw new Error("No photos could be downloaded.");
      }
      toast.info("Creating zip file...");
      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "STORE",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipBlob);
      link.download = `group_${groupId}_photos_${fileCount}items.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast.success(`Successfully downloaded ${fileCount} photos!`);
    } catch (err) {
      const error = err as Error;
      console.error("Bulk download failed:", error);
      toast.error(
        error.message || "An error occurred during the download process."
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEdit = (photoId: string) => {
    router.push(`/photo/${photoId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FiLoader className="animate-spin text-purple-500 text-4xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-900/20 rounded-lg p-8 text-center">
        <FiAlertTriangle className="text-red-400 text-4xl mb-4" />
        <h3 className="text-xl font-semibold text-red-400">
          Error Fetching Photos
        </h3>
        <p className="text-red-300">{error?.message}</p>
      </div>
    );
  }

  return (
    <PhotoLayout
      photos={photos?.map((p: any) => ({ ...p, id: p.id.toString() })) || []}
      title={""} // Title is handled by the parent Groups component
      onSingleDelete={handleSingleDelete}
      onBulkDelete={handleBulkDelete}
      onSingleDownload={handleSingleDownload}
      onBulkDownload={handleBulkDownload}
      onEdit={handleEdit}
      onUpload={handleUpload}
      isDeleting={isDeleting}
      isDownloading={isDownloading}
      isUploading={uploadMutation.isPending}
    />
  );
};

const Groups = () => {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const isDesktop = useIsDesktop();
  const { data: groups, isLoading, isError, error } = useGetGroups();
  const createGroupMutation = useCreateGroup();

  useEffect(() => {
    if (groups && groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0].id);
    }
  }, [groups, selectedGroup]);

  const handleCreateGroup = async () => {
    if (newGroupName.trim() === "") return;
    try {
      await createGroupMutation.mutateAsync({
        name: newGroupName,
        description: newGroupDescription,
        user_id: 1, // Replace with actual user ID
      });
      setNewGroupName("");
      setNewGroupDescription("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  const handleSelectGroup = (id: number) => {
    setSelectedGroup(id);
    setIsPanelOpen(false); // Close panel on selection
  };

  const filteredGroups = groups?.filter((group: Group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const currentGroupName =
    groups?.find((g: Group) => g.id === selectedGroup)?.name || "Select a Group";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900/30 to-indigo-900">
        <div className="text-white text-xl">Loading groups...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900/30 to-indigo-900">
        <div className="text-red-400 text-xl">
          Error fetching groups: {error?.message || 'Unknown error'}
        </div>
      </div>
    );
  }

  if (!groups || !Array.isArray(groups)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900/30 to-indigo-900">
        <div className="text-yellow-400 text-xl">No groups data available</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/30 to-indigo-900">
        {isDesktop ? (
          // --- DESKTOP LAYOUT ---
          <div className="flex h-screen">
            <div className="w-1/3 lg:w-1/4">
              <GroupListPanel
                groups={filteredGroups}
                selectedGroup={selectedGroup}
                onSelectGroup={handleSelectGroup}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAddGroupClick={() => setIsModalOpen(true)}
              />
            </div>
            <div className="flex-1 p-4 md:p-6 overflow-y-auto">
              {selectedGroup ? (
                <GroupPhotoLoader groupId={selectedGroup} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400/80 text-lg">
                  Select a group to view photos
                </div>
              )}
            </div>
          </div>
        ) : (
          // --- MOBILE LAYOUT ---
          <div className="relative h-screen overflow-hidden">
            <div className="h-full overflow-y-auto">
              {selectedGroup ? (
                <GroupPhotoLoader groupId={selectedGroup} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400/80 text-lg">
                  Select a group to view photos
                </div>
              )}
            </div>
            
            {/* Floating Action Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsPanelOpen(true)}
              className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg z-40"
              aria-label="Select Group"
            >
              <FiGrid size={24} />
            </motion.button>

            {/* Slide-over Panel */}
            <AnimatePresence>
              {isPanelOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsPanelOpen(false)}
                    className="fixed inset-0 bg-black/60 z-40"
                  />
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed top-0 left-0 h-full w-4/5 max-w-sm bg-gray-900 z-50"
                  >
                    <GroupListPanel
                      groups={filteredGroups}
                      selectedGroup={selectedGroup}
                      onSelectGroup={handleSelectGroup}
                      searchTerm={searchTerm}
                      onSearchChange={setSearchTerm}
                      onAddGroupClick={() => setIsModalOpen(true)}
                    />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create Group Modal (works for both layouts) */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-800 rounded-xl p-8 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Create New Group</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1">
                  <FiX />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Group Name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full bg-gray-700 rounded-md p-2"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  className="w-full bg-gray-700 rounded-md p-2 h-24"
                />
                <button
                  onClick={handleCreateGroup}
                  disabled={createGroupMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-md disabled:bg-gray-500"
                >
                  {createGroupMutation.isPending ? "Creating..." : "Create Group"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Groups;
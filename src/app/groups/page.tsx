"use client";
import PhotoLayout from "@/components/PhotoLayout";
import { useCreateGroup, useGetGroups, useGetGroupImages } from "@/api/groups";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiX, FiLoader, FiAlertTriangle, FiSearch } from "react-icons/fi";

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

  return <PhotoLayout photos={photos} groupId={groupId} deleteBulkMutation={()=>{}} deleteSingleMutation={()=>{}} />;
};

const Groups = () => {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredGroups = groups?.filter((group: Group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Handle case where groups is undefined or not an array
  if (!groups || !Array.isArray(groups)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900/30 to-indigo-900">
        <div className="text-yellow-400 text-xl">No groups data available</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-gray-900 via-purple-900/30 to-indigo-900">
        {/* Groups List - Left Side */}
        <div className="w-full md:w-1/3 lg:w-1/4 p-4 bg-gray-900/90 backdrop-blur-sm border-r border-gray-800 flex flex-col">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                Your Groups ({groups.length})
              </h2>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-grow">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800/50 rounded-md py-2 pl-10 pr-4 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full"
              >
                <FiPlus />
              </motion.button>
            </div>
          </div>
          <div
            className="flex-grow space-y-2 overflow-y-auto"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#4a5568 #2d3748'
            }}
          >
            {filteredGroups.map((group: Group) => (
              <motion.div
                key={group.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedGroup(group.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  selectedGroup === group.id
                    ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-500/20 shadow-lg"
                    : "hover:bg-gray-800/50"
                }`}
              >
                <h3 className="font-semibold text-gray-100">{group.name}</h3>
                {group.description && (
                  <p className="text-sm text-gray-300/60 mt-1">
                    {group.description}
                  </p>
                )}
                <p className="text-sm text-purple-300/80 mt-2">
                  {group.photocount || 0} photos
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Photos Grid - Right Side */}
        <div className="flex-1 p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {groups.find((g: Group) => g.id === selectedGroup)?.name ||
                "Select a Group"}
            </h2>
          </motion.div>

          {selectedGroup ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl bg-gray-900/50 backdrop-blur-sm p-4 shadow-xl border border-gray-800/50"
            >
              <GroupPhotoLoader groupId={selectedGroup} />
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400/80 text-lg">
              <motion.div
                animate={{ scale: [0.95, 1, 0.95] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-center"
              >
                <div className="text-2xl mb-2">📸</div>
                <div>Select a group to view photos</div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
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

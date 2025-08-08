"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiPlus } from 'react-icons/fi';

interface Group {
  id: number;
  name: string;
  description?: string;
  photocount?: number;
}

interface GroupListPanelProps {
  groups: Group[];
  selectedGroup: number | null;
  onSelectGroup: (id: number) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddGroupClick: () => void;
}

const GroupListPanel: React.FC<GroupListPanelProps> = ({
  groups,
  selectedGroup,
  onSelectGroup,
  searchTerm,
  onSearchChange,
  onAddGroupClick,
}) => {
  return (
    <div className="w-full h-full p-4 bg-gray-900/90 backdrop-blur-sm border-r border-gray-800 flex flex-col">
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
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-gray-800/50 rounded-md py-2 pl-10 pr-4 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddGroupClick}
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
        {groups.map((group: Group) => (
          <motion.div
            key={group.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelectGroup(group.id)}
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
  );
};

export default GroupListPanel;

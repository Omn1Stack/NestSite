"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  FiDownload,
  FiShare2,
  FiFolderPlus,
  FiTrash2,
  FiX,
  FiEdit,
} from "react-icons/fi";

// Helper component for consistent menu items
const ActionButton = ({
  icon,
  label,
  danger = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-3 text-sm rounded-lg ${
      danger
        ? "text-red-400 hover:bg-red-400/10"
        : "text-gray-100 hover:bg-gray-700"
    } transition-colors`}
  >
    <span className="text-base">{icon}</span>
    <span>{label}</span>
  </button>
);

export default function PortalMenu({
  photoId,
  onClose,
  onAction,
}: {
  photoId: string;
  onClose: () => void;
  onAction: (action: string, id: string) => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        ref={menuRef}
        className="bg-gray-800 rounded-xl shadow-xl w-full max-w-xs overflow-hidden"
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="font-medium text-lg">Photo Actions</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-full transition-colors"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-col p-2">
          <ActionButton
            icon={<FiEdit />}
            label="Edit"
            onClick={() => onAction("edit", photoId)}
          />
          <ActionButton
            icon={<FiDownload />}
            label="Download"
            onClick={() => onAction("download", photoId)}
          />
          <ActionButton
            icon={<FiShare2 />}
            label="Share"
            onClick={() => onAction("share", photoId)}
          />
          <ActionButton
            icon={<FiFolderPlus />}
            label="Add to Album"
            onClick={() => onAction("add-to-album", photoId)}
          />
          <ActionButton
            icon={<FiTrash2 />}
            label="Delete"
            danger
            onClick={() => onAction("delete", photoId)}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

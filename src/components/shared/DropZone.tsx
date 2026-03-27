"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { scaleFade } from "@/lib/motion";
import { formatFileSize } from "@/lib/utils/format";

const ACCEPTED_EXTENSIONS = ["stl", "obj", "ply", "3mf"];

interface DropZoneProps {
  onFileDrop: (file: File) => void;
  className?: string;
  compact?: boolean;
}

export function DropZone({ onFileDrop, className = "", compact = false }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndProcess = useCallback(
    (file: File) => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        return;
      }
      setDroppedFile(file);
      onFileDrop(file);
    },
    [onFileDrop]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) validateAndProcess(file);
    },
    [validateAndProcess]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateAndProcess(file);
    },
    [validateAndProcess]
  );

  const ext = droppedFile?.name.split(".").pop()?.toUpperCase();

  return (
    <motion.div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Upload 3D file"
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      className={`
        relative cursor-pointer group
        border-2 border-dashed rounded-2xl
        transition-all duration-400 ease-smooth
        ${isDragOver
          ? "border-red bg-red/[0.03] scale-[1.01]"
          : "border-gray-border hover:border-red/40 hover:bg-gray-light/50"
        }
        ${compact ? "p-6" : "p-12 md:p-16"}
        ${className}
      `}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".stl,.obj,.ply,.3mf"
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
      />

      <AnimatePresence mode="wait">
        {droppedFile ? (
          <motion.div
            key="file"
            {...scaleFade}
            className="text-center space-y-2"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red/[0.06]">
              <span className="text-micro font-bold text-red tracking-widest">
                {ext}
              </span>
            </div>
            <p className="text-body font-semibold text-black">
              {droppedFile.name}
            </p>
            <p className="text-caption text-gray">
              {formatFileSize(droppedFile.size)} — Click or drop to replace
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            {...scaleFade}
            className="text-center space-y-3"
          >
            {/* Upload icon */}
            <div className="mx-auto w-12 h-12 rounded-xl bg-gray-light flex items-center justify-center group-hover:bg-red/[0.06] transition-colors duration-300">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray group-hover:text-red transition-colors duration-300"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>

            <div>
              <p className="text-body font-medium text-black">
                {compact ? "Drop your 3D file" : "Drop your 3D file here"}
              </p>
              <p className="text-caption text-gray mt-1">
                STL, OBJ, PLY, or 3MF — {compact ? "" : "or click to browse"}
              </p>
            </div>

            {!compact && (
              <p className="text-micro uppercase tracking-widest text-gray-muted">
                No file? Enter dimensions manually below
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag-over pulse ring */}
      {isDragOver && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 rounded-2xl border-2 border-red/20 pointer-events-none"
        />
      )}
    </motion.div>
  );
}

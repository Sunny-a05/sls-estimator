/**
 * useFileProcessor — React hook that bridges file upload → geometry processing → stores.
 *
 * Usage:
 *   const { processFile, isProcessing, error } = useFileProcessor();
 *   <DropZone onFileDrop={processFile} />
 *
 * On drop, this hook:
 *   1. Reads the file as ArrayBuffer
 *   2. Runs processGeometryFile() (parse → bbox → volume → Three.js geo)
 *   3. Pushes geometry + stats into viewerStore
 *   4. Pushes dimensions + volume into wizardStore
 *   5. Returns control — the UI reacts via store subscriptions
 */

"use client";

import { useCallback, useState } from "react";
import { useViewerStore } from "@/stores/viewer-store";
import { useWizardStore } from "@/stores/wizard-store";
import { processGeometryFile } from "@/lib/parsers/geometry-processor";
import { FUSE1_CONFIG } from "@/lib/engine/config";

interface FileProcessorReturn {
  processFile: (file: File) => void;
  isProcessing: boolean;
  error: string | null;
  clearError: () => void;
}

export function useFileProcessor(): FileProcessorReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const viewer = useViewerStore();
  const wizard = useWizardStore();

  const processFile = useCallback(
    (file: File) => {
      setError(null);
      setIsProcessing(true);
      viewer.setParseStatus("loading", 10);

      const reader = new FileReader();

      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 50);
          viewer.setParseStatus("loading", pct);
        }
      };

      reader.onload = () => {
        try {
          viewer.setParseStatus("parsing", 60);

          const buffer = reader.result as ArrayBuffer;
          const result = processGeometryFile(
            buffer,
            file.name,
            FUSE1_CONFIG.nylonDensity
          );

          // Push to viewer store
          viewer.setGeometry(
            result.geometry,
            result.dimensions,
            result.boundingBox,
            result.triangleCount,
            result.fileName,
            result.format,
            file.size
          );
          viewer.setVolume(result.volumeMm3, "exact");
          viewer.setWasInches(result.wasInches);

          // Push to wizard store — auto-fill dimensions + volume
          wizard.setDimensions(
            result.dimensions.x,
            result.dimensions.y,
            result.dimensions.z,
            result.volumeMm3
          );

          setIsProcessing(false);
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : "Failed to parse file";
          viewer.setError(msg);
          setError(msg);
          setIsProcessing(false);
        }
      };

      reader.onerror = () => {
        const msg = "Failed to read file. Please try again.";
        viewer.setError(msg);
        setError(msg);
        setIsProcessing(false);
      };

      reader.readAsArrayBuffer(file);
    },
    [viewer, wizard]
  );

  const clearError = useCallback(() => setError(null), []);

  return { processFile, isProcessing, error, clearError };
}

import { create } from "zustand";
import type { BufferGeometry } from "three";
import type { Dimensions, BoundingBox } from "@/types/geometry";

type ParseStatus = "idle" | "loading" | "parsing" | "ready" | "error";
type VolumeMethod = "exact" | "voxel" | "bbox";

interface ViewerState {
  geometry: BufferGeometry | null;
  dimensions: Dimensions | null;
  boundingBox: BoundingBox | null;
  volume: number;
  volumeMethod: VolumeMethod;
  triangleCount: number;
  fileName: string;
  fileFormat: string;
  fileSize: number;
  parseStatus: ParseStatus;
  parseProgress: number;
  wasInches: boolean;
  errorMessage: string;

  setGeometry: (
    geometry: BufferGeometry,
    dims: Dimensions,
    bb: BoundingBox,
    triCount: number,
    fileName: string,
    format: string,
    fileSize: number
  ) => void;
  setVolume: (volume: number, method: VolumeMethod) => void;
  setParseStatus: (status: ParseStatus, progress?: number) => void;
  setWasInches: (wasInches: boolean) => void;
  setError: (message: string) => void;
  reset: () => void;
}

const initialState = {
  geometry: null,
  dimensions: null,
  boundingBox: null,
  volume: 0,
  volumeMethod: "exact" as VolumeMethod,
  triangleCount: 0,
  fileName: "",
  fileFormat: "",
  fileSize: 0,
  parseStatus: "idle" as ParseStatus,
  parseProgress: 0,
  wasInches: false,
  errorMessage: "",
};

export const useViewerStore = create<ViewerState>((set) => ({
  ...initialState,

  setGeometry: (geometry, dims, bb, triCount, fileName, format, fileSize) =>
    set({
      geometry,
      dimensions: dims,
      boundingBox: bb,
      triangleCount: triCount,
      fileName,
      fileFormat: format,
      fileSize,
      parseStatus: "ready",
      parseProgress: 100,
      errorMessage: "",
    }),

  setVolume: (volume, method) => set({ volume, volumeMethod: method }),

  setParseStatus: (status, progress) =>
    set({ parseStatus: status, parseProgress: progress ?? 0 }),

  setWasInches: (wasInches) => set({ wasInches }),

  setError: (message) =>
    set({ parseStatus: "error", errorMessage: message }),

  reset: () => set(initialState),
}));

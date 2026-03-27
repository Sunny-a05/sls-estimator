/**
 * File router — routes 3D files to the correct parser by extension.
 * Ported from js_viewer.html process3DFile().
 */

export type FileFormat = "stl" | "obj" | "ply" | "3mf";

const SUPPORTED_EXTENSIONS: FileFormat[] = ["stl", "obj", "ply", "3mf"];
const STEP_EXTENSIONS = ["step", "stp"];

export function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

export function isSupportedFormat(fileName: string): boolean {
  const ext = getFileExtension(fileName);
  return SUPPORTED_EXTENSIONS.includes(ext as FileFormat);
}

export function isStepFile(fileName: string): boolean {
  const ext = getFileExtension(fileName);
  return STEP_EXTENSIONS.includes(ext);
}

export function getFileFormat(fileName: string): FileFormat | null {
  const ext = getFileExtension(fileName);
  if (SUPPORTED_EXTENSIONS.includes(ext as FileFormat)) return ext as FileFormat;
  return null;
}

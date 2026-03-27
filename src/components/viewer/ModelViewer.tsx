"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Grid } from "@react-three/drei";
import { AnimatePresence } from "framer-motion";
import type { BufferGeometry } from "three";

import { ModelMesh } from "./ModelMesh";
import { ViewerEmpty } from "./ViewerEmpty";
import { ViewerLoading } from "./ViewerLoading";
import { ViewerOverlay } from "./ViewerOverlay";
import type { Dimensions } from "@/types/geometry";

interface ModelViewerProps {
  geometry: BufferGeometry | null;
  dimensions: Dimensions | null;
  volume?: number;
  triangleCount?: number;
  fileName?: string;
  fileSize?: number;
  wasInches?: boolean;
  parseStatus?: "idle" | "loading" | "parsing" | "ready" | "error";
  parseProgress?: number;
  className?: string;
  meshColor?: string;
}

export function ModelViewer({
  geometry,
  dimensions,
  volume = 0,
  triangleCount = 0,
  fileName = "",
  fileSize = 0,
  wasInches = false,
  parseStatus = "idle",
  parseProgress = 0,
  className = "",
  meshColor,
}: ModelViewerProps) {
  const isLoading = parseStatus === "loading" || parseStatus === "parsing";
  const hasModel = parseStatus === "ready" && geometry !== null;

  // Camera distance based on model size
  const cameraDistance = useMemo(() => {
    if (!dimensions) return 200;
    const maxDim = Math.max(dimensions.x, dimensions.y, dimensions.z);
    return maxDim * 2;
  }, [dimensions]);

  return (
    <div className={`relative w-full h-full min-h-[400px] bg-cream rounded-2xl overflow-hidden ${className}`}>
      {/* 3D Canvas */}
      {hasModel && (
        <Canvas
          camera={{
            position: [cameraDistance * 0.6, cameraDistance * 0.4, cameraDistance * 0.8],
            fov: 40,
            near: 0.1,
            far: cameraDistance * 10,
          }}
          shadows
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <Suspense fallback={null}>
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[cameraDistance, cameraDistance * 0.8, cameraDistance * 0.5]}
              intensity={1.2}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            <directionalLight
              position={[-cameraDistance * 0.5, cameraDistance * 0.3, -cameraDistance]}
              intensity={0.3}
            />

            {/* Model */}
            <ModelMesh geometry={geometry} color={meshColor} />

            {/* Ground */}
            <ContactShadows
              position={[0, -(dimensions?.z ?? 100) / 2, 0]}
              opacity={0.25}
              scale={cameraDistance}
              blur={2}
              far={cameraDistance}
            />
            <Grid
              args={[cameraDistance * 2, cameraDistance * 2]}
              position={[0, -(dimensions?.z ?? 100) / 2, 0]}
              cellSize={10}
              cellThickness={0.5}
              cellColor="#e5e5e5"
              sectionSize={50}
              sectionThickness={1}
              sectionColor="#d4d4d4"
              fadeDistance={cameraDistance * 2}
              fadeStrength={1}
              infiniteGrid
            />

            {/* Controls */}
            <OrbitControls
              enablePan
              enableZoom
              enableRotate
              minDistance={10}
              maxDistance={cameraDistance * 4}
              autoRotate={false}
              makeDefault
            />

            <Environment preset="studio" />
          </Suspense>
        </Canvas>
      )}

      {/* Empty state */}
      {!hasModel && !isLoading && <ViewerEmpty />}

      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <ViewerLoading
            progress={parseProgress}
            status={parseStatus === "loading" ? "Loading file..." : "Parsing geometry..."}
          />
        )}
      </AnimatePresence>

      {/* Stats overlay */}
      {hasModel && dimensions && (
        <ViewerOverlay
          dimensions={dimensions}
          volume={volume}
          triangleCount={triangleCount}
          fileName={fileName}
          fileSize={fileSize}
          wasInches={wasInches}
        />
      )}
    </div>
  );
}

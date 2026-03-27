"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import type { BufferGeometry, Mesh } from "three";
import * as THREE from "three";

interface ModelMeshProps {
  geometry: BufferGeometry;
  color?: string;
  wireframe?: boolean;
}

export function ModelMesh({
  geometry,
  color = "#C8102E",
  wireframe = false,
}: ModelMeshProps) {
  const meshRef = useRef<Mesh>(null);

  // Center geometry and compute normals once
  const centeredGeometry = useMemo(() => {
    const geo = geometry.clone();
    geo.computeBoundingBox();
    geo.center();
    geo.computeVertexNormals();
    return geo;
  }, [geometry]);

  // Gentle idle rotation
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <mesh ref={meshRef} geometry={centeredGeometry} castShadow receiveShadow>
      <meshPhysicalMaterial
        color={color}
        roughness={0.55}
        metalness={0.05}
        clearcoat={0.15}
        clearcoatRoughness={0.3}
        wireframe={wireframe}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

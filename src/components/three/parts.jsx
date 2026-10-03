import { useLayoutEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

const UP = new THREE.Vector3(0, 1, 0);

// A cylinder stretched between two points — handy for lamp arms, neon tubes, legs.
export function Segment({ start, end, radius = 0.03, children, ...props }) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new THREE.Vector3(...start);
    const b = new THREE.Vector3(...end);
    const dir = b.clone().sub(a);
    return {
      position: a.clone().add(b).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize()),
      length: dir.length(),
    };
  }, [start, end]);

  return (
    <mesh position={position} quaternion={quaternion} {...props}>
      <cylinderGeometry args={[radius, radius, length, 12]} />
      {children}
    </mesh>
  );
}

// Creates a CanvasTexture and re-runs `draw(ctx, w, h)` whenever deps change.
export function useCanvasTexture(width, height, draw, deps = []) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, [width, height]);

  useLayoutEffect(() => {
    draw(texture.image.getContext("2d"), width, height);
    texture.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texture, ...deps]);

  return texture;
}

// A grid of keycaps as a single instanced mesh.
export function Keycaps({ rows, cols, size = 0.05, gap = 0.014, height = 0.02, color = "#2a2c33", ...props }) {
  const ref = useRef();
  const count = rows * cols;

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const step = size + gap;
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        m.setPosition((c - (cols - 1) / 2) * step, 0, (r - (rows - 1) / 2) * step);
        ref.current.setMatrixAt(i++, m);
      }
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [rows, cols, size, gap]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} castShadow {...props}>
      <boxGeometry args={[size, height, size]} />
      <meshStandardMaterial color={color} roughness={0.6} />
    </instancedMesh>
  );
}

// Fits the scene on narrow/tall viewports by zooming the camera out.
export function ResponsiveZoom({ base = 1.35, min = 0.62 }) {
  const camera = useThree((s) => s.camera);
  const { width, height } = useThree((s) => s.size);

  useLayoutEffect(() => {
    const aspect = width / Math.max(height, 1);
    camera.zoom = Math.max(min, Math.min(1, aspect / base));
    camera.updateProjectionMatrix();
  }, [camera, width, height, base, min]);

  return null;
}

// Turns on shadows for every mesh in a group (cheaper than tagging each one by hand).
export function useShadows(ref) {
  useLayoutEffect(() => {
    ref.current?.traverse((obj) => {
      if (obj.isMesh && !obj.userData.noShadow) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
  }, [ref]);
}

// Deterministic pseudo-random numbers so the scene looks the same on every load.
export function seeded(seed = 1) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

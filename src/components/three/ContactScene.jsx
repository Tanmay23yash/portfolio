import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { profile } from "../../data/content.js";
import { Keycaps, ResponsiveZoom, useCanvasTexture } from "./parts.jsx";

const BEIGE = "#e9dfca";
const BEIGE_DARK = "#cfc3aa";

function Screen({ name, sent }) {
  const [blink, setBlink] = useState(true);
  const [fontsReady, setFontsReady] = useState(false);
  const timer = useRef(0);

  useEffect(() => {
    document.fonts?.ready.then(() => setFontsReady(true));
  }, []);

  useFrame((_, delta) => {
    timer.current += delta;
    if (timer.current > 0.55) {
      timer.current = 0;
      setBlink((b) => !b);
    }
  });

  const texture = useCanvasTexture(
    512,
    384,
    (ctx, w, h) => {
      const g = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.7);
      g.addColorStop(0, "#14261c");
      g.addColorStop(1, "#07100b");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      const who = (name.trim() || "stranger").slice(0, 18);
      const lines = [
        ["#7dffb2", `${profile.firstName.toUpperCase()}-OS v1.0`],
        ["#3f8f63", "────────────────────────"],
        ["#7dffb2", `> hello, ${who}!`],
        ["#7dffb2", "> thanks for stopping by."],
        ...(sent
          ? [
              ["#ffcf7d", "> message received."],
              ["#ffcf7d", "  talk soon!"],
            ]
          : [
              ["#ffcf7d", "> leave a note and I'll"],
              ["#ffcf7d", "  get back to you soon."],
            ]),
        ["#7dffb2", ">"],
      ];
      ctx.font = `600 22px ${fontsReady ? '"JetBrains Mono Variable", ' : ""}monospace`;
      ctx.textBaseline = "top";
      ctx.shadowBlur = 8;
      lines.forEach(([color, text], i) => {
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.fillText(text, 34, 40 + i * 42);
      });
      if (blink) {
        ctx.fillStyle = "#7dffb2";
        ctx.fillRect(34 + 22, 40 + 6 * 42, 14, 24);
      }
      ctx.shadowBlur = 0;
      // Scanlines
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 2);
    },
    [name, sent, blink, fontsReady],
  );

  return (
    <mesh position={[0, 0.12, 0.66]}>
      <planeGeometry args={[1.12, 0.84]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function Computer({ name, sent }) {
  const group = useRef();

  useFrame(({ pointer }, delta) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, -0.35 + pointer.x * 0.45, 3, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0.08 - pointer.y * 0.12, 3, delta);
  });

  return (
    <group ref={group} rotation={[0.08, -0.35, 0]}>
      {/* Monitor */}
      <RoundedBox args={[1.5, 1.2, 1.25]} radius={0.12} smoothness={4} position={[0, 0.1, 0]}>
        <meshStandardMaterial color={BEIGE} roughness={0.6} />
      </RoundedBox>
      <RoundedBox args={[1.28, 1.0, 0.1]} radius={0.06} position={[0, 0.12, 0.6]}>
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
      </RoundedBox>
      <Screen name={name} sent={sent} />
      {/* Floppy slot + power LED */}
      <mesh position={[0.35, -0.42, 0.63]}>
        <boxGeometry args={[0.42, 0.04, 0.02]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[-0.55, -0.42, 0.63]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshStandardMaterial color="#7dffb2" emissive="#7dffb2" emissiveIntensity={3} toneMapped={false} />
      </mesh>
      {/* Base */}
      <RoundedBox args={[1.25, 0.22, 1.05]} radius={0.06} position={[0, -0.62, -0.05]}>
        <meshStandardMaterial color={BEIGE_DARK} roughness={0.7} />
      </RoundedBox>
      {/* Keyboard */}
      <group position={[0, -0.7, 1.05]} rotation={[0.08, 0, 0]}>
        <RoundedBox args={[1.5, 0.08, 0.5]} radius={0.03}>
          <meshStandardMaterial color={BEIGE} roughness={0.6} />
        </RoundedBox>
        <Keycaps rows={4} cols={14} size={0.078} gap={0.018} height={0.04} position={[0, 0.05, 0]} color={BEIGE_DARK} />
      </group>
    </group>
  );
}

export default function ContactScene({ name = "", sent = false, active = true }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0.6, 5.4], fov: 32 }}
      gl={{ antialias: true }}
      style={{ position: "absolute", inset: 0 }}
      aria-label="3D retro computer that greets you by name"
    >
      <ResponsiveZoom base={1.1} min={0.7} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} color="#fff1e0" />
      <pointLight position={[-3, 1, -2]} intensity={12} color="#ffb45a" />
      <pointLight position={[0, 0.2, 2]} intensity={1.2} color="#7dffb2" distance={3} />
      <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.5} position={[0, 0.15, 0]}>
        <Computer name={name} sent={sent} />
      </Float>
      <ContactShadows position={[0, -1.15, 0]} opacity={0.45} scale={6} blur={2.6} far={2.5} />
    </Canvas>
  );
}

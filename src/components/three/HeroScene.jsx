import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, RoundedBox, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { Keycaps, ResponsiveZoom, Segment, seeded, useCanvasTexture, useShadows } from "./parts.jsx";

// A cosy corner-of-a-room diorama, built entirely from primitives.

const C = {
  floor: "#47352b",
  wall: "#262a37",
  wood: "#8a5a3c",
  woodDark: "#5e3c28",
  metal: "#2b2e36",
  amber: "#ffb45a",
  teal: "#5ff2d0",
  coral: "#ff7d6b",
  lavender: "#9d8cff",
  sky: "#6cc4ff",
  cream: "#efe6d8",
};

const SYNTAX = [C.coral, C.amber, C.teal, C.lavender, C.sky, "#c7cbd6", "#c7cbd6"];

// Pre-generate some "code" for the monitor: each line is an indent + coloured tokens.
const CODE = (() => {
  const rand = seeded(7);
  let indent = 0;
  return Array.from({ length: 48 }, () => {
    if (rand() < 0.2 && indent > 0) indent--;
    else if (rand() < 0.25 && indent < 3) indent++;
    const tokens = Array.from({ length: 1 + Math.floor(rand() * 4) }, () => ({
      w: 18 + rand() * 60,
      color: SYNTAX[Math.floor(rand() * SYNTAX.length)],
    }));
    return { indent, tokens };
  });
})();

function Monitor() {
  const [cursor, setCursor] = useState({ line: 0, token: 0, blink: true });
  const clock = useRef(0);

  useFrame((_, delta) => {
    clock.current += delta;
    if (clock.current < 0.22) return;
    clock.current = 0;
    setCursor(({ line, token, blink }) => {
      const next = { line, token: token + 1, blink: !blink };
      if (next.token > CODE[line].tokens.length) {
        next.token = 0;
        next.line = (line + 1) % CODE.length;
      }
      return next;
    });
  });

  const texture = useCanvasTexture(
    640,
    368,
    (ctx, w, h) => {
      ctx.fillStyle = "#0e1120";
      ctx.fillRect(0, 0, w, h);
      // Title bar
      ctx.fillStyle = "#171b2e";
      ctx.fillRect(0, 0, w, 28);
      [C.coral, C.amber, C.teal].forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(18 + i * 18, 14, 5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = "#262b45";
      ctx.fillRect(84, 7, 120, 14);
      // Sidebar
      ctx.fillStyle = "#121628";
      ctx.fillRect(0, 28, 110, h - 28);
      for (let i = 0; i < 9; i++) {
        ctx.fillStyle = i === 2 ? "#2d3460" : "#1d2238";
        ctx.fillRect(12, 44 + i * 26, 40 + ((i * 37) % 46), 10);
      }

      const rows = 15;
      const lineH = 21;
      const first = Math.max(0, cursor.line - rows + 1);
      for (let r = 0; first + r <= cursor.line; r++) {
        const n = first + r;
        const y = 44 + r * lineH;
        ctx.fillStyle = "#3a4060";
        ctx.fillRect(124, y, 14, 8);
        let x = 156 + CODE[n].indent * 26;
        const shown = n === cursor.line ? cursor.token : CODE[n].tokens.length;
        CODE[n].tokens.slice(0, shown).forEach((t) => {
          ctx.fillStyle = t.color;
          ctx.fillRect(x, y, t.w, 8);
          x += t.w + 9;
        });
        if (n === cursor.line && cursor.blink) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(x, y - 3, 3, 14);
        }
      }
    },
    [cursor],
  );

  return (
    <group position={[0.3, 1.2, -2.6]}>
      <mesh position={[0, 0.015, 0]}>
        <boxGeometry args={[0.45, 0.03, 0.28]} />
        <meshStandardMaterial color={C.metal} metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.27, -0.06]}>
        <boxGeometry args={[0.07, 0.5, 0.05]} />
        <meshStandardMaterial color={C.metal} metalness={0.4} roughness={0.4} />
      </mesh>
      <RoundedBox args={[1.56, 0.92, 0.07]} radius={0.03} position={[0, 0.76, -0.02]}>
        <meshStandardMaterial color="#1a1c22" roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0.77, 0.017]} userData={{ noShadow: true }}>
        <planeGeometry args={[1.46, 0.84]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0.75, 0.5]} color="#7c8cff" intensity={1.6} distance={3} decay={2} />
    </group>
  );
}

function Laptop() {
  // A training run: loss falling over steps, like the Mini-GPT perplexity curve.
  const texture = useCanvasTexture(400, 260, (ctx, w, h) => {
    ctx.fillStyle = "#f4f1ec";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#1a1c22";
    ctx.fillRect(0, 0, w, 26);
    ctx.fillStyle = C.amber;
    ctx.fillRect(16, 40, 120, 14);
    ctx.fillStyle = "#c9c3ba";
    ctx.fillRect(16, 62, 80, 8);
    const left = 30;
    const top = 86;
    const bottom = 236;
    const right = 380;
    ctx.strokeStyle = "#d8d1c6";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = top + ((bottom - top) * i) / 4;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
    }
    const curve = (noise, color, lift) => {
      const rand = seeded(noise);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 0; x <= 60; x++) {
        const t = x / 60;
        const v = Math.exp(-t * 4.2) * 0.85 + 0.08 + lift + (rand() - 0.5) * 0.04 * (1 - t);
        const px = left + t * (right - left);
        const py = bottom - (1 - v) * (bottom - top);
        if (x === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    };
    curve(3, C.coral, 0.04);
    curve(8, "#2b2e36", 0);
  });

  return (
    <group position={[1.45, 1.2, -2.15]} rotation={[0, -0.5, 0]}>
      <RoundedBox args={[0.62, 0.025, 0.42]} radius={0.01} position={[0, 0.0125, 0]}>
        <meshStandardMaterial color="#b9bcc4" metalness={0.6} roughness={0.35} />
      </RoundedBox>
      <group position={[0, 0.025, -0.21]} rotation={[-0.32, 0, 0]}>
        <RoundedBox args={[0.62, 0.4, 0.018]} radius={0.008} position={[0, 0.2, 0]}>
          <meshStandardMaterial color="#b9bcc4" metalness={0.6} roughness={0.35} />
        </RoundedBox>
        <mesh position={[0, 0.205, 0.0095]} userData={{ noShadow: true }}>
          <planeGeometry args={[0.56, 0.35]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function Lamp() {
  const [on, setOn] = useState(true);
  const [target] = useState(() => new THREE.Object3D());
  const head = [-0.62, 2.02, -2.3];
  const elbow = [-0.98, 1.88, -2.72];
  const base = [-0.95, 1.24, -2.62];

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        setOn((v) => !v);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => (document.body.style.cursor = "")}
    >
      <mesh position={[base[0], 1.22, base[2]]}>
        <cylinderGeometry args={[0.15, 0.17, 0.04, 24]} />
        <meshStandardMaterial color={C.metal} metalness={0.5} roughness={0.4} />
      </mesh>
      <Segment start={base} end={elbow} radius={0.022}>
        <meshStandardMaterial color={C.amber} metalness={0.3} roughness={0.4} />
      </Segment>
      <Segment start={elbow} end={head} radius={0.022}>
        <meshStandardMaterial color={C.amber} metalness={0.3} roughness={0.4} />
      </Segment>
      <mesh position={elbow}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color={C.metal} />
      </mesh>
      <group position={head} rotation={[0.5, 0, -0.35]}>
        <mesh position={[0, -0.06, 0]}>
          <coneGeometry args={[0.17, 0.22, 24, 1, true]} />
          <meshStandardMaterial color={C.amber} side={THREE.DoubleSide} metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.12, 0]} userData={{ noShadow: true }}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial
            color="#fff3dd"
            emissive="#ffd59a"
            emissiveIntensity={on ? 4 : 0}
            toneMapped={!on}
          />
        </mesh>
      </group>
      <pointLight
        position={[-0.55, 1.78, -2.2]}
        color="#ffbf73"
        intensity={on ? 5 : 0}
        distance={6}
        decay={1.6}
      />
      <primitive object={target} position={[-0.3, 1.2, -1.9]} />
      <spotLight
        position={[-0.58, 1.9, -2.25]}
        target={target}
        color="#ffcf8f"
        intensity={on ? 10 : 0}
        angle={0.75}
        penumbra={0.8}
        distance={4}
        decay={1.5}
      />
    </group>
  );
}

function Mug() {
  const steam = useRef([]);

  useFrame(({ clock }) => {
    steam.current.forEach((mesh, i) => {
      if (!mesh) return;
      const t = (clock.elapsedTime * 0.45 + i / 3) % 1;
      mesh.position.set(Math.sin(t * 6 + i) * 0.03, 0.12 + t * 0.4, 0);
      mesh.scale.setScalar(0.03 + t * 0.05);
      mesh.material.opacity = Math.sin(t * Math.PI) * 0.28;
    });
  });

  return (
    <group position={[-0.45, 1.2, -1.95]}>
      <mesh position={[0, 0.085, 0]}>
        <cylinderGeometry args={[0.075, 0.065, 0.17, 24]} />
        <meshStandardMaterial color={C.cream} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.165, 0]} userData={{ noShadow: true }}>
        <cylinderGeometry args={[0.066, 0.066, 0.005, 24]} />
        <meshStandardMaterial color="#4a2c1d" roughness={0.3} />
      </mesh>
      <mesh position={[0.085, 0.09, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.045, 0.012, 8, 16, Math.PI]} />
        <meshStandardMaterial color={C.cream} roughness={0.5} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(el) => (steam.current[i] = el)} userData={{ noShadow: true }}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial color="#ffffff" transparent depthWrite={false} opacity={0} />
        </mesh>
      ))}
    </group>
  );
}

function Desk() {
  const legs = [
    [-1.2, -1.82],
    [-1.2, -2.78],
  ];

  return (
    <group>
      <RoundedBox args={[3.3, 0.1, 1.2]} radius={0.02} position={[0.3, 1.15, -2.32]}>
        <meshStandardMaterial color={C.wood} roughness={0.7} />
      </RoundedBox>
      {legs.map(([x, z]) => (
        <mesh key={z} position={[x, 0.55, z]}>
          <boxGeometry args={[0.08, 1.1, 0.08]} />
          <meshStandardMaterial color={C.metal} />
        </mesh>
      ))}
      {/* Drawer unit */}
      <mesh position={[1.55, 0.55, -2.35]}>
        <boxGeometry args={[0.7, 1.1, 1.0]} />
        <meshStandardMaterial color={C.woodDark} roughness={0.8} />
      </mesh>
      {[0.85, 0.5, 0.15].map((y) => (
        <group key={y}>
          <mesh position={[1.55, y + 0.05, -1.845]}>
            <boxGeometry args={[0.62, 0.3, 0.02]} />
            <meshStandardMaterial color={C.wood} roughness={0.7} />
          </mesh>
          <mesh position={[1.55, y + 0.1, -1.825]}>
            <boxGeometry args={[0.18, 0.025, 0.025]} />
            <meshStandardMaterial color={C.metal} metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      ))}
      {/* Keyboard + mouse */}
      <RoundedBox args={[0.95, 0.035, 0.3]} radius={0.012} position={[0.25, 1.2175, -2.0]}>
        <meshStandardMaterial color="#d9d9de" roughness={0.5} />
      </RoundedBox>
      <Keycaps rows={4} cols={13} size={0.054} gap={0.012} position={[0.25, 1.24, -2.0]} color="#3a3d47" />
      <RoundedBox args={[0.09, 0.035, 0.15]} radius={0.016} position={[0.92, 1.2175, -1.98]}>
        <meshStandardMaterial color="#d9d9de" roughness={0.5} />
      </RoundedBox>
      <mesh position={[0.95, 1.201, -1.98]} rotation={[-Math.PI / 2, 0, 0]} userData={{ noShadow: true }}>
        <planeGeometry args={[0.32, 0.26]} />
        <meshStandardMaterial color="#1c1e24" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Chair() {
  return (
    <group position={[0.9, 0, -1.0]} rotation={[0, 1.0, 0]}>
      <RoundedBox args={[0.75, 0.1, 0.7]} radius={0.04} position={[0, 0.72, 0]}>
        <meshStandardMaterial color={C.teal} roughness={0.8} />
      </RoundedBox>
      <RoundedBox args={[0.72, 0.8, 0.09]} radius={0.04} position={[0, 1.22, 0.36]} rotation={[0.12, 0, 0]}>
        <meshStandardMaterial color="#2f3440" roughness={0.8} />
      </RoundedBox>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.55, 12]} />
        <meshStandardMaterial color={C.metal} metalness={0.6} roughness={0.3} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, a, 0]}>
            <mesh position={[0, 0.1, 0.18]}>
              <boxGeometry args={[0.05, 0.04, 0.36]} />
              <meshStandardMaterial color={C.metal} metalness={0.6} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.04, 0.34]}>
              <sphereGeometry args={[0.04, 12, 12]} />
              <meshStandardMaterial color="#15161a" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Plant({ position, scale = 1, leaves = 9, seed = 3 }) {
  const group = useRef();
  const parts = useMemo(() => {
    const rand = seeded(seed);
    const greens = ["#3f8f5a", "#5bb072", "#2f6e46", "#6cc07f"];
    return Array.from({ length: leaves }, (_, i) => ({
      ry: (i / leaves) * Math.PI * 2 + rand() * 0.4,
      rz: 0.25 + rand() * 0.55,
      len: 0.38 + rand() * 0.22,
      color: greens[Math.floor(rand() * greens.length)],
    }));
  }, [leaves, seed]);

  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.z = Math.sin(clock.elapsedTime * 0.9 + seed) * 0.03;
  });

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.27, 0.2, 0.5, 24]} />
        <meshStandardMaterial color="#c66a48" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.49, 0]} userData={{ noShadow: true }}>
        <cylinderGeometry args={[0.25, 0.25, 0.02, 24]} />
        <meshStandardMaterial color="#3a271c" />
      </mesh>
      <group ref={group} position={[0, 0.48, 0]}>
        {parts.map((p, i) => (
          <group key={i} rotation={[0, p.ry, p.rz]}>
            <mesh position={[0, p.len, 0]} scale={[0.1, p.len, 0.035]}>
              <sphereGeometry args={[1, 12, 12]} />
              <meshStandardMaterial color={p.color} roughness={0.7} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

function Shelves() {
  const books = useMemo(() => {
    const rand = seeded(11);
    const colors = [C.coral, C.amber, C.lavender, C.teal, C.sky, C.cream, "#e3557a"];
    const shelf = (y, from, to) => {
      const out = [];
      let z = from;
      while (z < to) {
        const w = 0.06 + rand() * 0.06;
        const h = 0.26 + rand() * 0.16;
        out.push({ y: y + h / 2, z: z + w / 2, w, h, color: colors[Math.floor(rand() * colors.length)] });
        z += w + 0.008;
      }
      return out;
    };
    return [...shelf(2.33, -1.55, -0.55), ...shelf(3.03, -1.2, -0.1)];
  }, []);

  return (
    <group>
      {[2.3, 3.0].map((y) => (
        <mesh key={y} position={[-2.8, y, -0.7]}>
          <boxGeometry args={[0.38, 0.05, 1.8]} />
          <meshStandardMaterial color={C.wood} roughness={0.7} />
        </mesh>
      ))}
      {books.map((b, i) => (
        <mesh key={i} position={[-2.82, b.y, b.z]}>
          <boxGeometry args={[0.26, b.h, b.w]} />
          <meshStandardMaterial color={b.color} roughness={0.75} />
        </mesh>
      ))}
      {/* A leaning book and a little succulent */}
      <mesh position={[-2.82, 2.5, -0.38]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[0.26, 0.36, 0.07]} />
        <meshStandardMaterial color={C.lavender} roughness={0.75} />
      </mesh>
      <Plant position={[-2.8, 2.325, 0.0]} scale={0.32} leaves={7} seed={21} />
      <Plant position={[-2.8, 3.025, -1.4]} scale={0.26} leaves={6} seed={5} />
    </group>
  );
}

function WindowFrame() {
  const sky = useCanvasTexture(256, 220, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#141a3d");
    g.addColorStop(0.6, "#3b2d63");
    g.addColorStop(1, "#d9716a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const rand = seeded(4);
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.3 + rand() * 0.7})`;
      ctx.fillRect(rand() * w, rand() * h * 0.6, 1.5, 1.5);
    }
    ctx.fillStyle = "#fff4dc";
    ctx.beginPath();
    ctx.arc(w * 0.72, h * 0.28, 18, 0, Math.PI * 2);
    ctx.fill();
    // Distant skyline
    ctx.fillStyle = "#1a1530";
    let x = 0;
    const r2 = seeded(9);
    while (x < w) {
      const bw = 14 + r2() * 26;
      const bh = 20 + r2() * 50;
      ctx.fillRect(x, h - bh, bw, bh);
      ctx.fillStyle = "#ffd27a";
      for (let k = 0; k < 4; k++) if (r2() < 0.5) ctx.fillRect(x + 4 + r2() * (bw - 8), h - bh + 6 + r2() * (bh - 10), 3, 3);
      ctx.fillStyle = "#1a1530";
      x += bw + 2;
    }
  });

  return (
    <group position={[-1.75, 2.7, -2.99]}>
      <mesh>
        <boxGeometry args={[1.4, 1.15, 0.06]} />
        <meshStandardMaterial color={C.cream} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.035]} userData={{ noShadow: true }}>
        <planeGeometry args={[1.26, 1.01]} />
        <meshBasicMaterial map={sky} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[0.04, 1.01, 0.03]} />
        <meshStandardMaterial color={C.cream} />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[1.26, 0.04, 0.03]} />
        <meshStandardMaterial color={C.cream} />
      </mesh>
      <mesh position={[0, -0.6, 0.08]}>
        <boxGeometry args={[1.5, 0.05, 0.2]} />
        <meshStandardMaterial color={C.cream} roughness={0.6} />
      </mesh>
      <pointLight position={[0, 0, 0.6]} color="#8f7dff" intensity={1.2} distance={3} decay={2} />
    </group>
  );
}

function Poster() {
  const art = useCanvasTexture(240, 300, (ctx, w, h) => {
    ctx.fillStyle = "#f0e6d8";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = C.amber;
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.42, 70, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.coral;
    ctx.fillRect(0, h * 0.62, w, h * 0.38);
    ctx.fillStyle = "#2b2e36";
    ctx.beginPath();
    ctx.moveTo(0, h * 0.75);
    ctx.lineTo(w * 0.35, h * 0.55);
    ctx.lineTo(w * 0.6, h * 0.7);
    ctx.lineTo(w * 0.8, h * 0.58);
    ctx.lineTo(w, h * 0.68);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();
  });

  return (
    <group position={[2.1, 2.65, -2.99]}>
      <mesh>
        <boxGeometry args={[0.78, 0.96, 0.04]} />
        <meshStandardMaterial color="#15161a" />
      </mesh>
      <mesh position={[0, 0, 0.022]} userData={{ noShadow: true }}>
        <planeGeometry args={[0.66, 0.84]} />
        <meshStandardMaterial map={art} roughness={0.9} />
      </mesh>
    </group>
  );
}

function WallClock() {
  const hour = useRef();
  const minute = useRef();

  useFrame(() => {
    const now = new Date();
    const m = now.getMinutes() + now.getSeconds() / 60;
    const h = (now.getHours() % 12) + m / 60;
    if (minute.current) minute.current.rotation.z = -(m / 60) * Math.PI * 2;
    if (hour.current) hour.current.rotation.z = -(h / 12) * Math.PI * 2;
  });

  return (
    <group position={[0.3, 3.2, -2.98]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.05, 32]} />
        <meshStandardMaterial color="#15161a" />
      </mesh>
      <mesh position={[0, 0, 0.026]} userData={{ noShadow: true }}>
        <circleGeometry args={[0.22, 32]} />
        <meshStandardMaterial color={C.cream} />
      </mesh>
      <group ref={hour} position={[0, 0, 0.03]}>
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[0.02, 0.12, 0.005]} />
          <meshStandardMaterial color="#15161a" />
        </mesh>
      </group>
      <group ref={minute} position={[0, 0, 0.034]}>
        <mesh position={[0, 0.085, 0]}>
          <boxGeometry args={[0.012, 0.17, 0.005]} />
          <meshStandardMaterial color={C.coral} />
        </mesh>
      </group>
    </group>
  );
}

// "</>" in neon tubes on the side wall.
function NeonSign() {
  const tubes = [
    [[0, 0.18, 0.62], [0, 0, 0.42]],
    [[0, 0, 0.42], [0, -0.18, 0.62]],
    [[0, -0.22, 0.12], [0, 0.22, -0.12]],
    [[0, 0.18, -0.42], [0, 0, -0.62]],
    [[0, 0, -0.62], [0, -0.18, -0.42]],
  ];

  return (
    <group position={[-2.94, 1.45, -0.7]}>
      {tubes.map(([a, b], i) => (
        <Segment key={i} start={a} end={b} radius={0.022} userData={{ noShadow: true }}>
          <meshStandardMaterial color={C.teal} emissive={C.teal} emissiveIntensity={3} toneMapped={false} />
        </Segment>
      ))}
      <pointLight position={[0.4, 0, 0]} color={C.teal} intensity={1.5} distance={2.5} decay={2} />
    </group>
  );
}

function Room() {
  const group = useRef();
  useShadows(group);

  // Gentle parallax toward the pointer.
  useFrame(({ pointer }, delta) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, pointer.x * 0.06, 3, delta);
    g.position.y = Math.sin(performance.now() / 1800) * 0.04;
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      {/* Shell */}
      <mesh position={[-0.125, -0.15, -0.125]}>
        <boxGeometry args={[6.25, 0.3, 6.25]} />
        <meshStandardMaterial color={C.floor} roughness={0.85} />
      </mesh>
      <mesh position={[-0.125, 1.85, -3.125]}>
        <boxGeometry args={[6.25, 4.3, 0.25]} />
        <meshStandardMaterial color={C.wall} roughness={0.95} />
      </mesh>
      <mesh position={[-3.125, 1.85, -0.125]}>
        <boxGeometry args={[0.25, 4.3, 6.25]} />
        <meshStandardMaterial color={C.wall} roughness={0.95} />
      </mesh>
      {/* Rug */}
      <mesh position={[0.5, 0.01, -0.9]}>
        <cylinderGeometry args={[1.45, 1.45, 0.02, 48]} />
        <meshStandardMaterial color="#4b3f7a" roughness={1} />
      </mesh>
      <mesh position={[0.5, 0.022, -0.9]}>
        <cylinderGeometry args={[1.15, 1.15, 0.01, 48]} />
        <meshStandardMaterial color="#5c4f93" roughness={1} />
      </mesh>

      <Desk />
      <Monitor />
      <Laptop />
      <Lamp />
      <Mug />
      <Chair />
      <Plant position={[-2.45, 0, -2.45]} scale={1.15} />
      <Shelves />
      <WindowFrame />
      <Poster />
      <WallClock />
      <NeonSign />
    </group>
  );
}

export default function HeroScene({ active = true }) {
  const touch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [8.6, 6.6, 8.6], fov: 30, near: 0.1, far: 60 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ touchAction: touch ? "pan-y" : "none" }}
      aria-label="3D illustration of a cosy desk setup"
    >
      <ResponsiveZoom />
      <ambientLight intensity={0.55} color="#c9cfff" />
      <hemisphereLight args={["#b8c4ff", "#3b2c25", 0.6]} />
      <directionalLight
        position={[6, 9, 5]}
        intensity={1.1}
        color="#ffe9d6"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <Room />
      <Sparkles count={40} scale={[5, 3, 5]} position={[-0.2, 2, -0.6]} size={2.2} speed={0.25} opacity={0.6} color="#ffd9a8" />
      <OrbitControls
        enabled={!touch}
        enableZoom={false}
        enablePan={false}
        target={[-0.2, 1.4, -0.7]}
        minPolarAngle={Math.PI / 4.2}
        maxPolarAngle={Math.PI / 2.4}
        minAzimuthAngle={Math.PI / 4 - 0.55}
        maxAzimuthAngle={Math.PI / 4 + 0.55}
        rotateSpeed={0.5}
        enableDamping
      />
    </Canvas>
  );
}

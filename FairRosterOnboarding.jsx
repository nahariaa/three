import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Grid,
  MeshTransmissionMaterial,
  RoundedBox,
} from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";
import { ArrowRight } from "lucide-react";

const sceneCopy = [
  {
    title: "Fairness, Engineered.",
    subtitle: "6 months of historical debt, balanced in a single heartbeat.",
  },
  {
    title: "Total Visibility.",
    subtitle:
      "Real-time overlaps and weekend tracking. Informed decisions, not forced rules.",
  },
  {
    title: "Your Roster, Refined.",
    subtitle: "Join the elite departments using data to protect their staff's time.",
  },
];

function useResponsiveScale() {
  const { viewport } = useThree();
  return useMemo(() => {
    if (viewport.width < 5) return 0.85;
    if (viewport.width < 8) return 0.95;
    return 1;
  }, [viewport.width]);
}

function JellyLights({ pulseStrength = 0.25 }) {
  const materialRef = useRef();

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    const t = clock.getElapsedTime();
    const pulse = (Math.sin(t * 1.5) + 1) * 0.5;
    materialRef.current.thickness = 1.2 + pulse * pulseStrength;
  });

  return (
    <mesh position={[0, 0.55, -0.2]}>
      <RoundedBox args={[0.65, 0.18, 0.32]} radius={0.08} smoothness={8}>
        <MeshTransmissionMaterial
          ref={materialRef}
          color="#2DD4BF"
          roughness={0.1}
          transmission={1}
          thickness={1.2}
          ior={1.25}
          distortion={0.25}
          distortionScale={0.25}
          temporalDistortion={0.1}
        />
      </RoundedBox>
    </mesh>
  );
}

function Ambulance({ sceneIndex, interactiveTilt }) {
  const groupRef = useRef();
  const scaleRef = useRef(new THREE.Vector3(1, 1, 1));
  const baseRotation = useRef(new THREE.Euler());
  const responsiveScale = useResponsiveScale();

  useEffect(() => {
    if (!groupRef.current) return;
    const group = groupRef.current;
    gsap.fromTo(
      group.position,
      { y: -1, z: -2 },
      { y: 0, z: 0, duration: 1.4, ease: "back.out(1.8)" }
    );
    gsap.fromTo(
      group.scale,
      { x: 0.2, y: 0.2, z: 0.2 },
      { x: 1, y: 1, z: 1, duration: 1.4, ease: "back.out(1.8)" }
    );
  }, [sceneIndex]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const t = clock.getElapsedTime();
    const floatOffset = Math.sin(t * 1.2) * 0.08;

    // Pixar-style squash & stretch:
    // When the vehicle "lands" (sine wave crest), we squash (wider X/Z, shorter Y),
    // preserving volume by inversely scaling Y against X/Z.
    const hopWave = sceneIndex === 1 ? Math.max(0, Math.sin(t * 2.0)) : 0;
    const squash = hopWave * 0.12;
    const stretch = hopWave * 0.2;

    scaleRef.current.set(
      1 + squash,
      1 - stretch,
      1 + squash
    );

    const breathing = sceneIndex === 0 ? Math.sin(t * Math.PI) * 0.02 : 0;

    groupRef.current.scale.lerp(
      scaleRef.current.clone().multiplyScalar(responsiveScale).multiply(
        new THREE.Vector3(1, 1 + breathing, 1)
      ),
      0.2
    );

    groupRef.current.position.y = floatOffset;

    const tiltX = interactiveTilt.current.y * 0.25;
    const tiltZ = interactiveTilt.current.x * -0.35;

    baseRotation.current.set(tiltX, sceneIndex === 1 ? 0.3 : 0, tiltZ);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      baseRotation.current.x,
      0.08
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      baseRotation.current.y,
      0.08
    );
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      baseRotation.current.z,
      0.08
    );
  });

  return (
    <group ref={groupRef}>
      <mesh castShadow receiveShadow>
        <RoundedBox args={[2.2, 0.8, 1.1]} radius={0.2} smoothness={8}>
          <meshStandardMaterial color="#F8FAFC" roughness={0.4} metalness={0.05} />
        </RoundedBox>
      </mesh>
      <mesh position={[0.6, 0.2, 0]} castShadow>
        <RoundedBox args={[1.1, 0.6, 1.05]} radius={0.2} smoothness={8}>
          <meshStandardMaterial color="#FFFFFF" roughness={0.35} metalness={0.04} />
        </RoundedBox>
      </mesh>
      <mesh position={[0, -0.35, 0]} castShadow>
        <RoundedBox args={[2.3, 0.4, 1.2]} radius={0.25} smoothness={8}>
          <meshStandardMaterial color="#E2E8F0" roughness={0.55} />
        </RoundedBox>
      </mesh>

      <mesh position={[-0.6, -0.25, 0.55]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.2, 24]} />
        <meshStandardMaterial color="#0F172A" roughness={0.35} />
      </mesh>
      <mesh position={[0.8, -0.25, 0.55]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.2, 24]} />
        <meshStandardMaterial color="#0F172A" roughness={0.35} />
      </mesh>
      <mesh position={[-0.6, -0.25, -0.55]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.2, 24]} />
        <meshStandardMaterial color="#0F172A" roughness={0.35} />
      </mesh>
      <mesh position={[0.8, -0.25, -0.55]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.2, 24]} />
        <meshStandardMaterial color="#0F172A" roughness={0.35} />
      </mesh>

      <JellyLights />
    </group>
  );
}

function SpeedTrail({ active }) {
  const trailRef = useRef();
  const points = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) =>
        new THREE.Vector3(-1.2 - i * 0.15, -0.2, (i % 2 === 0 ? 0.4 : -0.4))
      ),
    []
  );

  useFrame(({ clock }) => {
    if (!trailRef.current || !active) return;
    const t = clock.getElapsedTime();
    trailRef.current.geometry.setFromPoints(
      points.map((point, i) =>
        point
          .clone()
          .add(
            new THREE.Vector3(
              Math.sin(t * 2 + i * 0.3) * 0.08,
              Math.cos(t * 2 + i * 0.2) * 0.05,
              0
            )
          )
      )
    );
  });

  return (
    <line ref={trailRef} visible={active}>
      <bufferGeometry />
      <lineBasicMaterial color="#2DD4BF" linewidth={2} />
    </line>
  );
}

function ParticleLogo({ active }) {
  const pointsRef = useRef();
  const { viewport } = useThree();
  const [progress, setProgress] = useState(0);

  const { startPositions, targetPositions } = useMemo(() => {
    const count = 600;
    const start = new Float32Array(count * 3);
    const target = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 2 + Math.random() * 1.5;

      start[i * 3] =
        radius * Math.sin(phi) * Math.cos(theta);
      start[i * 3 + 1] =
        radius * Math.sin(phi) * Math.sin(theta);
      start[i * 3 + 2] = radius * Math.cos(phi);

      const gridX = (i % 20) - 10;
      const gridY = Math.floor(i / 20) - 7;
      target[i * 3] = gridX * 0.12;
      target[i * 3 + 1] = gridY * 0.12;
      target[i * 3 + 2] = 0;
    }

    return { startPositions: start, targetPositions: target };
  }, []);

  useEffect(() => {
    if (!active) {
      setProgress(0);
      return;
    }

    const tween = gsap.to({ value: 0 }, {
      value: 1,
      duration: 1.2,
      ease: "power4.inOut",
      onUpdate: function () {
        setProgress(this.targets()[0].value);
      },
    });

    return () => tween.kill();
  }, [active]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const positions = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] = THREE.MathUtils.lerp(
        startPositions[i],
        targetPositions[i],
        progress
      );
      positions[i + 1] = THREE.MathUtils.lerp(
        startPositions[i + 1],
        targetPositions[i + 1],
        progress
      );
      positions[i + 2] = THREE.MathUtils.lerp(
        startPositions[i + 2],
        targetPositions[i + 2],
        progress
      );
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} position={[0, 0.4, 0]} visible={active}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={startPositions.length / 3}
          array={startPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#2DD4BF"
        size={viewport.width < 6 ? 0.04 : 0.03}
        sizeAttenuation
        transparent
        opacity={0.9}
      />
    </points>
  );
}

function Scene({ sceneIndex, interactiveTilt }) {
  const gridRef = useRef();
  const { camera } = useThree();

  useEffect(() => {
    if (!camera) return;

    if (sceneIndex === 1) {
      gsap.to(camera.position, {
        x: 2.8,
        y: 1.4,
        z: 4.2,
        duration: 1,
        ease: "power4.inOut",
      });
    } else {
      gsap.to(camera.position, {
        x: 0,
        y: 1.2,
        z: 5.2,
        duration: 1,
        ease: "power4.inOut",
      });
    }
  }, [camera, sceneIndex]);

  useFrame(({ clock }) => {
    if (!gridRef.current) return;
    const t = clock.getElapsedTime();
    if (sceneIndex === 1) {
      gridRef.current.position.z = (t * 2) % 4;
    } else {
      gridRef.current.position.z = 0;
    }
  });

  return (
    <group>
      <SpotLighting />
      <Ambulance sceneIndex={sceneIndex} interactiveTilt={interactiveTilt} />
      <SpeedTrail active={sceneIndex === 1} />
      <ParticleLogo active={sceneIndex === 2} />
      <Grid
        ref={gridRef}
        args={[20, 20]}
        cellColor="#1E293B"
        sectionColor="#0F172A"
        fadeDistance={14}
        fadeStrength={2}
        position={[0, -0.6, 0]}
      />
      <ContactShadows
        opacity={0.55}
        scale={10}
        blur={2.5}
        far={3}
        position={[0, -0.6, 0]}
      />
    </group>
  );
}

function SpotLighting() {
  return (
    <>
      <ambientLight intensity={0.65} />
      <spotLight
        position={[4, 6, 4]}
        angle={0.5}
        penumbra={0.9}
        intensity={1.4}
        color="#ffffff"
        castShadow
      />
      <directionalLight position={[-3, 2, 4]} intensity={0.6} />
    </>
  );
}

export default function FairRosterOnboarding() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const interactiveTilt = useRef(new THREE.Vector2(0, 0));
  const ambulanceRef = useRef();

  const handleNext = () => {
    const nextScene = (sceneIndex + 1) % sceneCopy.length;

    if (ambulanceRef.current) {
      gsap.to(ambulanceRef.current.scale, {
        x: 1.35,
        y: 1.35,
        z: 1.35,
        duration: 0.4,
        ease: "power4.inOut",
        onComplete: () => {
          gsap.to(ambulanceRef.current.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 0.6,
            ease: "power4.inOut",
          });
        },
      });
    }

    setSceneIndex(nextScene);
  };

  return (
    <div style={styles.wrapper}>
      <Canvas
        dpr={[1, 2]}
        shadows
        camera={{ position: [0, 1.2, 5.2], fov: 45 }}
        onPointerMove={(event) => {
          interactiveTilt.current.set(
            event.pointer.x * 0.6,
            event.pointer.y * 0.6
          );
        }}
      >
        <color attach="background" args={["#020617"]} />
        <group ref={ambulanceRef}>
          <Scene sceneIndex={sceneIndex} interactiveTilt={interactiveTilt} />
        </group>
      </Canvas>

      <div style={styles.overlay}>
        <div style={styles.header}>
          <span style={styles.logo}>FairRoster</span>
          <button style={styles.linkButton} type="button">
            Docs
          </button>
        </div>
        <div style={styles.content}>
          <p style={styles.eyebrow}>Scene {sceneIndex + 1} of 3</p>
          <h1 style={styles.title}>{sceneCopy[sceneIndex].title}</h1>
          <p style={styles.subtitle}>{sceneCopy[sceneIndex].subtitle}</p>
          <div style={styles.actions}>
            <button style={styles.primaryButton} type="button">
              Get Started
            </button>
            <button style={styles.secondaryButton} type="button" onClick={handleNext}>
              Next
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    position: "relative",
    width: "100%",
    height: "100vh",
    overflow: "hidden",
    fontFamily: "'Inter', 'SF Pro Text', sans-serif",
    color: "#E2E8F0",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "4vh 6vw",
    pointerEvents: "none",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
  },
  logo: {
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    fontSize: "0.75rem",
  },
  linkButton: {
    pointerEvents: "auto",
    background: "transparent",
    border: "1px solid rgba(148, 163, 184, 0.4)",
    color: "#E2E8F0",
    padding: "0.4rem 0.9rem",
    borderRadius: "999px",
    fontSize: "0.8rem",
  },
  content: {
    maxWidth: "520px",
    pointerEvents: "auto",
    backdropFilter: "blur(24px)",
    background: "rgba(2, 6, 23, 0.45)",
    border: "1px solid rgba(148, 163, 184, 0.25)",
    borderRadius: "24px",
    padding: "2.2rem",
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.45)",
  },
  eyebrow: {
    textTransform: "uppercase",
    letterSpacing: "0.35em",
    fontSize: "0.65rem",
    color: "rgba(148, 163, 184, 0.7)",
    marginBottom: "1.5rem",
  },
  title: {
    fontFamily: "'Playfair Display', 'Times New Roman', serif",
    fontSize: "2.6rem",
    marginBottom: "1rem",
  },
  subtitle: {
    fontSize: "1rem",
    lineHeight: 1.7,
    color: "rgba(226, 232, 240, 0.7)",
  },
  actions: {
    marginTop: "2rem",
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
  },
  primaryButton: {
    pointerEvents: "auto",
    background: "linear-gradient(135deg, rgba(45, 212, 191, 0.9), rgba(59, 130, 246, 0.8))",
    border: "none",
    color: "#020617",
    fontWeight: 600,
    padding: "0.85rem 1.8rem",
    borderRadius: "999px",
    cursor: "pointer",
  },
  secondaryButton: {
    pointerEvents: "auto",
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(148, 163, 184, 0.3)",
    color: "#E2E8F0",
    padding: "0.85rem 1.6rem",
    borderRadius: "999px",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    cursor: "pointer",
  },
};

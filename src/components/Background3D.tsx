import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Box, Octahedron, Torus } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

function AnimatedSphere({ position, color, size, speed }: { 
  position: [number, number, number]; 
  color: string; 
  size: number;
  speed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.15;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={0.8}>
      <Sphere ref={meshRef} args={[size, 64, 64]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.1}
          transparent
          opacity={0.2}
        />
      </Sphere>
    </Float>
  );
}

function FloatingBox({ position, color, size, speed }: {
  position: [number, number, number];
  color: string;
  size: number;
  speed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.3;
      meshRef.current.rotation.z = state.clock.elapsedTime * speed * 0.1;
    }
  });

  return (
    <Float speed={speed * 0.8} rotationIntensity={0.8} floatIntensity={1}>
      <Box ref={meshRef} args={[size, size, size]} position={position}>
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.15}
          wireframe
        />
      </Box>
    </Float>
  );
}

function FloatingOctahedron({ position, color, size, speed }: {
  position: [number, number, number];
  color: string;
  size: number;
  speed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.15;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.25;
    }
  });

  return (
    <Float speed={speed * 1.2} rotationIntensity={1} floatIntensity={0.6}>
      <Octahedron ref={meshRef} args={[size]} position={position}>
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.2}
          metalness={0.5}
          roughness={0.3}
        />
      </Octahedron>
    </Float>
  );
}

function FloatingTorus({ position, color, speed }: {
  position: [number, number, number];
  color: string;
  speed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.2;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={0.7}>
      <Torus ref={meshRef} args={[0.8, 0.3, 16, 32]} position={position}>
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.18}
          metalness={0.3}
          roughness={0.5}
        />
      </Torus>
    </Float>
  );
}

function FloatingRings() {
  const ringRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.15;
      ringRef.current.rotation.y = state.clock.elapsedTime * 0.08;
      ringRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.15) * 0.1;
    }
  });

  return (
    <group ref={ringRef}>
      <mesh position={[0, 0, -5]} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[3.5, 0.025, 16, 100]} />
        <meshBasicMaterial color="#dc2626" transparent opacity={0.25} />
      </mesh>
      <mesh position={[0, 0, -5]} rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[2.8, 0.02, 16, 100]} />
        <meshBasicMaterial color="#dc2626" transparent opacity={0.2} />
      </mesh>
      <mesh position={[0, 0, -5]} rotation={[Math.PI / 2, Math.PI / 6, 0]}>
        <torusGeometry args={[2.2, 0.015, 16, 100]} />
        <meshBasicMaterial color="#dc2626" transparent opacity={0.15} />
      </mesh>
      <mesh position={[0, 0, -5]} rotation={[Math.PI / 5, Math.PI / 3, Math.PI / 8]}>
        <torusGeometry args={[1.8, 0.01, 16, 100]} />
        <meshBasicMaterial color="#fca5a5" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particleCount = 200;
  const { positions, sizes } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15 - 5;
      sizes[i] = Math.random() * 0.05 + 0.02;
    }
    return { positions: pos, sizes };
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.03;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.04} 
        color="#dc2626" 
        transparent 
        opacity={0.5} 
        sizeAttenuation 
      />
    </points>
  );
}

function GlowingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particleCount = 50;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 3;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = -state.clock.elapsedTime * 0.02;
      particlesRef.current.rotation.z = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.08} 
        color="#fca5a5" 
        transparent 
        opacity={0.6} 
        sizeAttenuation 
      />
    </points>
  );
}

function MovingLines() {
  const linesRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.z = state.clock.elapsedTime * 0.05;
    }
  });

  const lines = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      angle: (i / 8) * Math.PI * 2,
      length: 3 + Math.random() * 2,
      offset: Math.random() * 2,
    }));
  }, []);

  return (
    <group ref={linesRef} position={[0, 0, -8]}>
      {lines.map((line, i) => (
        <mesh 
          key={i} 
          position={[
            Math.cos(line.angle) * (4 + line.offset),
            Math.sin(line.angle) * (4 + line.offset),
            0
          ]}
          rotation={[0, 0, line.angle]}
        >
          <boxGeometry args={[line.length, 0.01, 0.01]} />
          <meshBasicMaterial color="#dc2626" transparent opacity={0.1} />
        </mesh>
      ))}
    </group>
  );
}

export default function Background3D() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 75 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.6} />
        <pointLight position={[-5, 5, 5]} intensity={0.3} color="#dc2626" />
        
        {/* Main Spheres */}
        <AnimatedSphere position={[-5, 3, -4]} color="#dc2626" size={1.8} speed={0.8} />
        <AnimatedSphere position={[5, -2, -5]} color="#fca5a5" size={1.2} speed={1.2} />
        <AnimatedSphere position={[0, 4, -7]} color="#dc2626" size={2.2} speed={0.6} />
        <AnimatedSphere position={[-3, -4, -6]} color="#f87171" size={1} speed={1.5} />
        <AnimatedSphere position={[6, 2, -8]} color="#fecaca" size={1.5} speed={0.9} />
        
        {/* Floating Boxes */}
        <FloatingBox position={[-6, -1, -5]} color="#dc2626" size={0.8} speed={1} />
        <FloatingBox position={[4, 4, -6]} color="#f87171" size={0.6} speed={1.3} />
        
        {/* Octahedrons */}
        <FloatingOctahedron position={[3, -4, -4]} color="#dc2626" size={0.7} speed={1.1} />
        <FloatingOctahedron position={[-4, 1, -7]} color="#fca5a5" size={0.5} speed={1.4} />
        
        {/* Torus shapes */}
        <FloatingTorus position={[-2, -3, -5]} color="#dc2626" speed={0.9} />
        <FloatingTorus position={[5, 0, -7]} color="#f87171" speed={1.1} />
        
        {/* Rings and Lines */}
        <FloatingRings />
        <MovingLines />
        
        {/* Particles */}
        <ParticleField />
        <GlowingParticles />
      </Canvas>
    </div>
  );
}

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  w: number;
  h: number;
  dx: number;
  dy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  life: number;
  decay: number;
}

interface ConfettiProps {
  isActive: boolean;
}

export const Confetti: React.FC<ConfettiProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationId = useRef<number>(0);

  const colors = ['#dc2626', '#ffffff', '#ef4444', '#f8fafc', '#b91c1c'];

  const createParticle = (originX: number, originY: number): Particle => ({
    x: originX,
    y: originY,
    w: Math.random() * 8 + 4,
    h: Math.random() * 6 + 3,
    dx: (Math.random() - 0.5) * 8, // Horizontal Spread
    dy: -(Math.random() * 15 + 10), // High UPWARD velocity (Cannon shot)
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 15,
    color: colors[Math.floor(Math.random() * colors.length)],
    life: 1,
    decay: Math.random() * 0.008 + 0.003,
  });

  const loop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.current.length - 1; i >= 0; i--) {
      const p = particles.current[i];
      
      // Physics
      p.dy += 0.35; // Strong gravity
      p.x += p.dx;
      p.y += p.dy;
      p.dx *= 0.98; // Air resistance
      p.rotation += p.rotationSpeed;
      p.life -= p.decay;

      // Render
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();

      if (p.life <= 0 || p.y > canvas.height + 20) {
        particles.current.splice(i, 1);
      }
    }

    if (particles.current.length > 0 || isActive) {
       animationId.current = requestAnimationFrame(loop);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    if (isActive) {
      const canvas = canvasRef.current;
      if (canvas) {
        // CANNON 1: Left Side (30% width)
        for (let i = 0; i < 60; i++) {
          particles.current.push(createParticle(canvas.width * 0.25, canvas.height));
        }
        // CANNON 2: Right Side (70% width)
        for (let i = 0; i < 60; i++) {
          particles.current.push(createParticle(canvas.width * 0.75, canvas.height));
        }
      }
      
      if (!animationId.current) {
        loop();
      }
    }
  }, [isActive]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-50"
    />
  );
};
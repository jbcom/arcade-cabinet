import { useEffect, useRef } from "react";
import { cn } from "../lib/utils";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
}

interface CosmicDustProps {
  particleCount?: number;
  className?: string;
}

export function CosmicDust({ particleCount = 200, className }: CosmicDustProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);
  const particlesRef = useRef<Particle[]>([]);
  const dimensionsRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const colors = [
      "rgba(255, 255, 255,",
      "rgba(255, 215, 180,",
      "rgba(200, 180, 255,",
      "rgba(255, 200, 220,",
      "rgba(180, 220, 255,",
    ];

    const createParticle = (index: number, width: number, height: number): Particle => ({
      color: colors[index % colors.length],
      opacity: 0.2 + normalizedHash(index, 31, 89) * 0.8,
      size: 0.5 + normalizedHash(index, 17, 71) * 2.5,
      speedX: (normalizedHash(index, 23, 83) - 0.5) * 0.15,
      speedY: (normalizedHash(index, 29, 79) - 0.5) * 0.15,
      twinklePhase: normalizedHash(index, 47, 101) * Math.PI * 2,
      twinkleSpeed: normalizedHash(index, 41, 97) * 0.015 + 0.005,
      x: normalizedHash(index, 37, 103) * width,
      y: normalizedHash(index, 43, 107) * height,
    });

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      dimensionsRef.current = { width, height };

      particlesRef.current = Array.from({ length: particleCount }, (_, index) =>
        createParticle(index, width, height)
      );
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const animate = (time: number) => {
      const { width, height } = dimensionsRef.current;

      ctx.clearRect(0, 0, width, height);

      particlesRef.current.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < -10) particle.x = width + 10;
        if (particle.x > width + 10) particle.x = -10;
        if (particle.y < -10) particle.y = height + 10;
        if (particle.y > height + 10) particle.y = -10;

        const twinkle = Math.sin(time * particle.twinkleSpeed + particle.twinklePhase);
        const currentOpacity = particle.opacity * (0.4 + twinkle * 0.6);

        if (particle.size > 1.5) {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
          const glowGradient = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            particle.size * 4
          );
          glowGradient.addColorStop(0, `${particle.color}${currentOpacity * 0.4})`);
          glowGradient.addColorStop(0.5, `${particle.color}${currentOpacity * 0.1})`);
          glowGradient.addColorStop(1, `${particle.color}0)`);
          ctx.fillStyle = glowGradient;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `${particle.color}${currentOpacity})`;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 w-full h-full pointer-events-none", className)}
    />
  );
}

function normalizedHash(index: number, step: number, modulo: number): number {
  return ((index * step + step * 0.5) % modulo) / modulo;
}

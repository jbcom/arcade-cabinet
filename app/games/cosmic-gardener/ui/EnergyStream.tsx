import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface EnergyStreamProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  flowRate: number;
  active: boolean;
}

export function EnergyStream({ fromX, fromY, toX, toY, flowRate, active }: EnergyStreamProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);
  const particlesRef = useRef<Array<{ t: number; speed: number; size: number }>>([]);

  useEffect(() => {
    if (!active) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    particlesRef.current = Array.from({ length: 8 }, (_, index) => ({
      size: 2 + normalizedHash(index, 31, 71) * 2,
      speed: 0.003 + normalizedHash(index, 23, 67) * 0.002,
      t: normalizedHash(index, 17, 59),
    }));

    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const startX = (fromX / 100) * width;
      const startY = (fromY / 100) * height;
      const endX = (toX / 100) * width;
      const endY = (toY / 100) * height;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = "rgba(251, 191, 36, 0.15)";
      ctx.lineWidth = 12;
      ctx.lineCap = "round";
      ctx.stroke();

      const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
      gradient.addColorStop(0, "rgba(251, 191, 36, 0.8)");
      gradient.addColorStop(0.5, "rgba(236, 72, 153, 0.6)");
      gradient.addColorStop(1, "rgba(168, 85, 247, 0.8)");

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.stroke();

      particlesRef.current.forEach((particle) => {
        particle.t += particle.speed * flowRate;
        if (particle.t > 1) particle.t = 0;

        const x = startX + (endX - startX) * particle.t;
        const y = startY + (endY - startY) * particle.t;

        const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, particle.size * 4);
        particleGradient.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        particleGradient.addColorStop(0.2, "rgba(251, 191, 36, 0.7)");
        particleGradient.addColorStop(0.5, "rgba(251, 191, 36, 0.3)");
        particleGradient.addColorStop(1, "rgba(251, 191, 36, 0)");

        ctx.beginPath();
        ctx.arc(x, y, particle.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = particleGradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
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
  }, [fromX, fromY, toX, toY, flowRate, active]);

  if (!active) return null;

  return (
    <motion.canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    />
  );
}

function normalizedHash(index: number, step: number, modulo: number): number {
  return ((index * step + step * 0.5) % modulo) / modulo;
}

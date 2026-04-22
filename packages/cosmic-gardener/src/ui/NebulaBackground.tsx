import { useEffect, useRef } from "react";
import { cn } from "../lib/utils";

interface NebulaBackgroundProps {
  className?: string;
}

export function NebulaBackground({ className }: NebulaBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let width = 0;
    let height = 0;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const blobs = [
      { x: 0.2, y: 0.3, radius: 0.35, color: [139, 92, 246], alpha: 0.35, speed: 0.0003, phase: 0 },
      {
        x: 0.7,
        y: 0.2,
        radius: 0.4,
        color: [236, 72, 153],
        alpha: 0.3,
        speed: 0.0004,
        phase: Math.PI / 3,
      },
      {
        x: 0.5,
        y: 0.7,
        radius: 0.45,
        color: [168, 85, 247],
        alpha: 0.25,
        speed: 0.0002,
        phase: Math.PI / 2,
      },
      {
        x: 0.8,
        y: 0.6,
        radius: 0.3,
        color: [251, 191, 36],
        alpha: 0.2,
        speed: 0.0005,
        phase: Math.PI,
      },
      {
        x: 0.3,
        y: 0.8,
        radius: 0.35,
        color: [219, 39, 119],
        alpha: 0.25,
        speed: 0.0003,
        phase: Math.PI * 1.5,
      },
      {
        x: 0.15,
        y: 0.5,
        radius: 0.25,
        color: [99, 102, 241],
        alpha: 0.2,
        speed: 0.0004,
        phase: Math.PI * 0.7,
      },
    ];

    const animate = (time: number) => {
      const gradient = ctx.createLinearGradient(0, 0, width * 0.3, height);
      gradient.addColorStop(0, "#0c0a1a");
      gradient.addColorStop(0.3, "#150d2e");
      gradient.addColorStop(0.6, "#1a0a2e");
      gradient.addColorStop(1, "#0f0720");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      blobs.forEach((blob) => {
        const oscillation = Math.sin(time * blob.speed + blob.phase) * 0.15;
        const x = blob.x * width + Math.sin(time * blob.speed * 2 + blob.phase) * width * 0.08;
        const y = blob.y * height + Math.cos(time * blob.speed * 1.5 + blob.phase) * height * 0.08;
        const radius = blob.radius * Math.min(width, height) * (1 + oscillation);

        const blobGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        const [r, g, b] = blob.color;
        blobGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${blob.alpha})`);
        blobGradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${blob.alpha * 0.5})`);
        blobGradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${blob.alpha * 0.2})`);
        blobGradient.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.fillStyle = blobGradient;
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 0.015;
      for (let i = 0; i < 80; i++) {
        const nx = Math.random() * width;
        const ny = Math.random() * height;
        const hue = 260 + Math.random() * 80;
        ctx.fillStyle = `hsl(${hue}, 60%, ${40 + Math.random() * 40}%)`;
        ctx.fillRect(nx, ny, 1.5, 1.5);
      }
      ctx.globalAlpha = 1;

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 w-full h-full", className)}
      style={{ filter: "blur(50px)" }}
    />
  );
}

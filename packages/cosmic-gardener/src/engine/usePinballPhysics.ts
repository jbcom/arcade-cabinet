import { useCallback, useEffect, useRef, useState } from "react";

export interface PinballOrb {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  active: boolean;
  trail: Array<{ x: number; y: number; age: number }>;
}

interface UsePinballPhysicsProps {
  stars: Map<string, { id: string; x: number; y: number; energy: number; growthStage: number }>;
  onStarHit: (starId: string) => void;
  onDrain: () => void;
}

export function usePinballPhysics({ stars, onStarHit, onDrain }: UsePinballPhysicsProps) {
  const [orbs, setOrbs] = useState<Map<string, PinballOrb>>(new Map());
  const [leftFlipper, setLeftFlipper] = useState(false);
  const [rightFlipper, setRightFlipper] = useState(false);
  const animationRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(0);

  const GRAVITY = 0.15;
  const FRICTION = 0.995;
  const BOUNCE_DAMPENING = 0.7;
  const STAR_BOUNCE_FORCE = 1.2;
  const FLIPPER_FORCE = 12;
  const MAX_TRAIL_LENGTH = 15;

  const launchOrb = useCallback(
    (fromX: number, fromY: number, angle: number, power: number = 8) => {
      const id = `orb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const radians = (angle * Math.PI) / 180;

      const newOrb: PinballOrb = {
        id,
        x: fromX,
        y: fromY,
        vx: Math.cos(radians) * power,
        vy: Math.sin(radians) * power,
        radius: 1.2,
        active: true,
        trail: [],
      };

      setOrbs((prev) => {
        const next = new Map(prev);
        next.set(id, newOrb);
        return next;
      });

      return id;
    },
    []
  );

  const activateLeftFlipper = useCallback(() => setLeftFlipper(true), []);
  const deactivateLeftFlipper = useCallback(() => setLeftFlipper(false), []);
  const activateRightFlipper = useCallback(() => setRightFlipper(true), []);
  const deactivateRightFlipper = useCallback(() => setRightFlipper(false), []);

  useEffect(() => {
    if (orbs.size === 0) return undefined;

    const simulate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = Math.min((time - lastTimeRef.current) / 16.67, 2);
      lastTimeRef.current = time;

      setOrbs((prevOrbs) => {
        const next = new Map(prevOrbs);

        next.forEach((orb, id) => {
          if (!orb.active) return;

          orb.vy += GRAVITY * delta;
          orb.vx *= FRICTION;
          orb.vy *= FRICTION;
          orb.x += orb.vx * delta;
          orb.y += orb.vy * delta;

          orb.trail.push({ x: orb.x, y: orb.y, age: 0 });
          if (orb.trail.length > MAX_TRAIL_LENGTH) {
            orb.trail.shift();
          }
          orb.trail.forEach((t) => {
            t.age++;
          });

          if (orb.x < 3) {
            orb.x = 3;
            orb.vx = Math.abs(orb.vx) * BOUNCE_DAMPENING;
          }
          if (orb.x > 97) {
            orb.x = 97;
            orb.vx = -Math.abs(orb.vx) * BOUNCE_DAMPENING;
          }
          if (orb.y < 3) {
            orb.y = 3;
            orb.vy = Math.abs(orb.vy) * BOUNCE_DAMPENING;
          }

          const flipperY = 88;
          const leftFlipperX = 25;
          const rightFlipperX = 75;
          const flipperWidth = 15;

          if (orb.y > flipperY && orb.y < 95) {
            if (
              leftFlipper &&
              orb.x > leftFlipperX - flipperWidth / 2 &&
              orb.x < leftFlipperX + flipperWidth / 2
            ) {
              const hitPos = (orb.x - leftFlipperX) / (flipperWidth / 2);
              orb.vy = -FLIPPER_FORCE;
              orb.vx = hitPos * 5 + 3;
              orb.y = flipperY - 1;
            }
            if (
              rightFlipper &&
              orb.x > rightFlipperX - flipperWidth / 2 &&
              orb.x < rightFlipperX + flipperWidth / 2
            ) {
              const hitPos = (orb.x - rightFlipperX) / (flipperWidth / 2);
              orb.vy = -FLIPPER_FORCE;
              orb.vx = hitPos * 5 - 3;
              orb.y = flipperY - 1;
            }
          }

          if (orb.y > 100) {
            orb.active = false;
            onDrain();
          }

          stars.forEach((star) => {
            const dx = orb.x - star.x;
            const dy = orb.y - star.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = orb.radius + 3 + star.growthStage * 0.5;

            if (dist < minDist && dist > 0) {
              const nx = dx / dist;
              const ny = dy / dist;
              const relativeVel = orb.vx * nx + orb.vy * ny;

              if (relativeVel < 0) {
                orb.vx -= 2 * relativeVel * nx * STAR_BOUNCE_FORCE;
                orb.vy -= 2 * relativeVel * ny * STAR_BOUNCE_FORCE;
                orb.x = star.x + nx * (minDist + 0.5);
                orb.y = star.y + ny * (minDist + 0.5);
                onStarHit(star.id);
              }
            }
          });

          next.set(id, { ...orb });
        });

        next.forEach((orb, id) => {
          if (!orb.active) next.delete(id);
        });

        return next;
      });

      animationRef.current = requestAnimationFrame(simulate);
    };

    animationRef.current = requestAnimationFrame(simulate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [orbs.size, stars, leftFlipper, rightFlipper, onStarHit, onDrain]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "z" || e.key === "Z" || e.key === "ArrowLeft") {
        activateLeftFlipper();
      }
      if (e.key === "/" || e.key === "ArrowRight") {
        activateRightFlipper();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "z" || e.key === "Z" || e.key === "ArrowLeft") {
        deactivateLeftFlipper();
      }
      if (e.key === "/" || e.key === "ArrowRight") {
        deactivateRightFlipper();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [activateLeftFlipper, deactivateLeftFlipper, activateRightFlipper, deactivateRightFlipper]);

  return {
    orbs,
    leftFlipper,
    rightFlipper,
    launchOrb,
    activateLeftFlipper,
    deactivateLeftFlipper,
    activateRightFlipper,
    deactivateRightFlipper,
  };
}

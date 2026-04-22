import { isCabinetRuntimePaused } from "@logic/shared";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  advanceEnergyNetwork,
  COSMIC_ENERGY_CAPACITY,
  calculateGrowthStage,
  createEnergyStream,
  createStarId,
  createStarSeed,
  type EnergyStream,
  MAX_COSMIC_COLD,
  type StarSeed,
} from "./cosmicGardenSimulation";

export type { EnergyStream, StarSeed } from "./cosmicGardenSimulation";

interface UseEnergyRoutingProps {
  onEnergyDepleted?: () => void;
}

export function useEnergyRouting({ onEnergyDepleted }: UseEnergyRoutingProps = {}) {
  const [stars, setStars] = useState<Map<string, StarSeed>>(new Map());
  const [streams, setStreams] = useState<Map<string, EnergyStream>>(new Map());
  const [totalEnergy, setTotalEnergy] = useState(COSMIC_ENERGY_CAPACITY);
  const [cosmicCold, setCosmicCold] = useState(0);
  const animationRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(0);
  const nextStarIdRef = useRef(1);

  const plantSeed = useCallback(
    (x: number, y: number): string | null => {
      if (totalEnergy < 20) return null;

      const id = createStarId(nextStarIdRef.current, x, y);
      nextStarIdRef.current += 1;
      const newStar = createStarSeed({
        energy: 20,
        id,
        maxEnergy: 100,
        x,
        y,
      });

      setStars((prev) => {
        const next = new Map(prev);
        next.set(id, newStar);
        return next;
      });

      setTotalEnergy((prev) => prev - 20);
      return id;
    },
    [totalEnergy]
  );

  const createStream = useCallback(
    (fromId: string, toId: string): string | null => {
      const existingKey = `${fromId}-${toId}`;
      const reverseKey = `${toId}-${fromId}`;

      if (streams.has(existingKey) || streams.has(reverseKey)) return null;

      const stream = createEnergyStream(fromId, toId);

      setStreams((prev) => {
        const next = new Map(prev);
        next.set(existingKey, stream);
        return next;
      });

      setStars((prev) => {
        const next = new Map(prev);
        const fromStar = next.get(fromId);
        const toStar = next.get(toId);

        if (fromStar && !fromStar.connections.includes(toId)) {
          next.set(fromId, { ...fromStar, connections: [...fromStar.connections, toId] });
        }
        if (toStar && !toStar.connections.includes(fromId)) {
          next.set(toId, { ...toStar, connections: [...toStar.connections, fromId] });
        }

        return next;
      });

      return existingKey;
    },
    [streams]
  );

  const removeStream = useCallback((streamId: string) => {
    setStreams((prev) => {
      const next = new Map(prev);
      next.delete(streamId);
      return next;
    });
  }, []);

  const transferEnergy = useCallback(
    (starId: string, amount: number) => {
      if (totalEnergy < amount) return;

      setStars((prev) => {
        const next = new Map(prev);
        const star = next.get(starId);
        if (star) {
          const newEnergy = Math.min(star.energy + amount, star.maxEnergy);
          const newStage = calculateGrowthStage(newEnergy, star.maxEnergy);
          next.set(starId, { ...star, energy: newEnergy, growthStage: newStage });
        }
        return next;
      });

      setTotalEnergy((prev) => prev - amount);
    },
    [totalEnergy]
  );

  const checkConstellationComplete = useCallback(
    (requiredConnections: Array<{ from: string; to: string }>): boolean => {
      const starsArray = Array.from(stars.values());
      const fullyGrown = starsArray.filter((s) => s.growthStage === 3);

      if (fullyGrown.length < requiredConnections.length + 1) return false;

      for (const conn of requiredConnections) {
        const hasConnection = Array.from(streams.values()).some(
          (s) =>
            (s.fromId === conn.from && s.toId === conn.to) ||
            (s.fromId === conn.to && s.toId === conn.from)
        );
        if (!hasConnection) return false;
      }

      return true;
    },
    [stars, streams]
  );

  useEffect(() => {
    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (!isCabinetRuntimePaused()) {
        setCosmicCold((prev) => {
          const newCold = prev + delta * 0.5;
          if (newCold >= MAX_COSMIC_COLD && onEnergyDepleted) {
            onEnergyDepleted();
          }
          return Math.min(newCold, MAX_COSMIC_COLD);
        });

        setStars((prevStars) => advanceEnergyNetwork(prevStars, streams, delta));
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [streams, onEnergyDepleted]);

  const seedStars = useCallback(
    (seededStars: StarSeed[], energyBudget = COSMIC_ENERGY_CAPACITY) => {
      setStars(new Map(seededStars.map((star) => [star.id, star])));
      setStreams(new Map());
      setTotalEnergy(energyBudget);
      setCosmicCold(0);
      lastTimeRef.current = 0;
      nextStarIdRef.current = seededStars.length + 1;
    },
    []
  );

  const resetGame = useCallback(() => {
    seedStars([]);
  }, [seedStars]);

  return {
    stars,
    streams,
    totalEnergy,
    cosmicCold,
    plantSeed,
    createStream,
    removeStream,
    transferEnergy,
    checkConstellationComplete,
    seedStars,
    resetGame,
  };
}

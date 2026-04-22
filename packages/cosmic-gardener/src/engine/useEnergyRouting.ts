import { useCallback, useEffect, useRef, useState } from "react";

export interface StarSeed {
  id: string;
  x: number;
  y: number;
  energy: number;
  maxEnergy: number;
  growthStage: number; // 0-3: seed, sprout, growing, full
  connections: string[];
  isPlanted: boolean;
}

export interface EnergyStream {
  id: string;
  fromId: string;
  toId: string;
  flowRate: number;
  active: boolean;
}

interface UseEnergyRoutingProps {
  onEnergyDepleted?: () => void;
}

function getGrowthStage(energy: number, maxEnergy: number): number {
  const percentage = energy / maxEnergy;
  if (percentage >= 0.9) return 3;
  if (percentage >= 0.6) return 2;
  if (percentage >= 0.3) return 1;
  return 0;
}

export function useEnergyRouting({ onEnergyDepleted }: UseEnergyRoutingProps = {}) {
  const [stars, setStars] = useState<Map<string, StarSeed>>(new Map());
  const [streams, setStreams] = useState<Map<string, EnergyStream>>(new Map());
  const [totalEnergy, setTotalEnergy] = useState(500);
  const [cosmicCold, setCosmicCold] = useState(0);
  const animationRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(0);

  const plantSeed = useCallback(
    (x: number, y: number): string | null => {
      if (totalEnergy < 20) return null;

      const id = `star-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newStar: StarSeed = {
        id,
        x,
        y,
        energy: 20,
        maxEnergy: 100,
        growthStage: 0,
        connections: [],
        isPlanted: true,
      };

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

      const stream: EnergyStream = {
        id: existingKey,
        fromId,
        toId,
        flowRate: 2,
        active: true,
      };

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
          const newStage = getGrowthStage(newEnergy, star.maxEnergy);
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

      setCosmicCold((prev) => {
        const newCold = prev + delta * 0.5;
        if (newCold >= 100 && onEnergyDepleted) {
          onEnergyDepleted();
        }
        return Math.min(newCold, 100);
      });

      setStars((prevStars) => {
        const next = new Map(prevStars);

        streams.forEach((stream) => {
          if (!stream.active) return;

          const fromStar = next.get(stream.fromId);
          const toStar = next.get(stream.toId);

          if (fromStar && toStar && fromStar.energy > 10) {
            const transferAmount = Math.min(stream.flowRate * delta, fromStar.energy - 10);
            const toReceive = Math.min(transferAmount, toStar.maxEnergy - toStar.energy);

            if (toReceive > 0) {
              next.set(stream.fromId, {
                ...fromStar,
                energy: fromStar.energy - toReceive,
                growthStage: getGrowthStage(fromStar.energy - toReceive, fromStar.maxEnergy),
              });
              next.set(stream.toId, {
                ...toStar,
                energy: toStar.energy + toReceive,
                growthStage: getGrowthStage(toStar.energy + toReceive, toStar.maxEnergy),
              });
            }
          }
        });

        return next;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [streams, onEnergyDepleted]);

  const resetGame = useCallback(() => {
    setStars(new Map());
    setStreams(new Map());
    setTotalEnergy(500);
    setCosmicCold(0);
    lastTimeRef.current = 0;
  }, []);

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
    resetGame,
  };
}

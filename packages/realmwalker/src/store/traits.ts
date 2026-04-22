import { trait } from "koota";
import { createInitialRealmState } from "../engine/realmSimulation";

export const RealmTrait = trait(() => createInitialRealmState());

export const MovementTrait = trait(() => ({
  x: 0,
  z: 0,
}));

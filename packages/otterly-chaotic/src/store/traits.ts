import { trait } from "koota";
import { createInitialState } from "../engine/simulation";

export const OtterlyTrait = trait(() => createInitialState() as never);

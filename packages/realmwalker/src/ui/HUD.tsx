import { HUDOverlay } from "@arcade-cabinet/shared";
import { useTrait } from "koota/react";
import { realmEntity } from "../store/world";
import { RealmTrait } from "../store/traits";

export function HUD() {
  const state = useTrait(realmEntity, RealmTrait);

  return (
    <HUDOverlay
      topLeft={
        <div style={{ color: '#e2e8f0', fontFamily: 'serif' }}>
          <div style={{ fontSize: 12, letterSpacing: '2px', opacity: 0.6 }}>REALMWALKER v1.0</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#c084fc' }}>ZONE {state.zone}</div>
        </div>
      }
      topRight={
        <div style={{ textAlign: 'right', color: '#e2e8f0', fontFamily: 'serif' }}>
          <div style={{ fontSize: 12, letterSpacing: '2px', opacity: 0.6 }}>VITALITY</div>
          <div style={{ width: 200, height: 12, background: '#1e1b4b', border: '1px solid #c084fc', marginTop: 4, position: 'relative', overflow: 'hidden' }}>
            <div style={{ width: `${(state.hp / state.maxHp) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #7c3aed, #c084fc)' }} />
          </div>
          <div style={{ fontSize: 14, marginTop: 4 }}>ATK: {state.atk}</div>
        </div>
      }
      bottomLeft={
        <div style={{ color: '#94a3b8', fontFamily: 'serif', fontSize: 14 }}>
           [W][A][S][D] - Navigate the Realm | [CLICK] - Strike
        </div>
      }
      bottomRight={
        <div style={{ textAlign: 'right', color: '#e2e8f0', fontFamily: 'serif' }}>
          <div style={{ fontSize: 12, letterSpacing: '2px', opacity: 0.6 }}>LOOT COLLECTED</div>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>{state.loot.length}</div>
        </div>
      }
    />
  );
}

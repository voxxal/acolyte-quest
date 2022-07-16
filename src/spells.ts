import { drain } from "./spells/drain";
import { fireball } from "./spells/fireball";
import { fireboom } from "./spells/fireboom";
import { meteor } from "./spells/meteor";
import { repulsor } from "./spells/repulsor";
import { teleport } from "./spells/teleport";
import { voidRush } from "./spells/voidRush";

export interface SpellData {
  name: string;
  unlockLevel: number;
  slot: string;
  builder: (level: number) => AcolyteFightSpell;
  scaling: (level: number) => number;
  maxLevel: number;
}
// should be called SpellsData
export const spells = new Map<string, SpellData>(
  Object.entries({
    voidRush, // 1
    teleport, // 6

    fireball, // 1
    fireboom, // 4

    repulsor, // 5
    drain, // 7

    meteor, // 8
  })
);

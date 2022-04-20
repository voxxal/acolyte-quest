import { fireball } from "./spells/fireball";
import { fireboom } from "./spells/fireboom";
import { repulsor } from "./spells/repulsor";
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
    voidRush: {
      name: "Void Rush",
      slot: "a",
      unlockLevel: 1,
      builder: voidRush,
      scaling: (level: number) => 5 * level + 0.1 * level ** 2,
      maxLevel: 25,
    },
    fireball: {
      name: "Fireball",
      slot: "q",
      unlockLevel: 1,
      builder: fireball,
      scaling: (level: number) => 5 * level + 0.1 * level ** 2,
      maxLevel: 25,
    },
    fireboom: {
      name: "Fireboom",
      slot: "q",
      unlockLevel: 5,
      builder: fireboom,
      scaling: (level: number) => 10 * level + 0.1 * level ** 2,
      maxLevel: 50,
    },
    repulsor: {
      name: "Repulsor",
      slot: "w",
      unlockLevel: 6,
      builder: repulsor,
      scaling: (level: number) => 10 * level + 0.1 * level ** 2,
      maxLevel: 50,
    },
  })
);

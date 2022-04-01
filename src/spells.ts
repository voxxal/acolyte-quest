import { fireball } from "../assets/spells/fireball";
import { fireboom } from "../assets/spells/fireboom";

export interface SpellData {
  name: string;
  unlockLevel: number;
  slot: string;
  builder: (level: number) => Spell;
  scaling: (level: number) => number;
  maxLevel: number;
}

export const spells = new Map<string, SpellData>(
  Object.entries({
    voidRush: {
      name: "Void Rush",
      slot: "a",
      unlockLevel: 1,
      builder: null,
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
      scaling: (level: number) =>  10 * level + 0.1 * level ** 2,
      maxLevel: 50,
    },
  })
);

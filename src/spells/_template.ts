import { TicksPerSecond } from "../modlyte";
import { SpellData } from "../spells";

const builder = (level: number): AcolyteFightSpell => ({} as any);

export const template: SpellData = {
  name: "Template",
  slot: "slot",
  unlockLevel: 1000,
  builder,
  scaling: (level: number) => 13 * level + 0.13 * level ** 2,
  maxLevel: 50,
};

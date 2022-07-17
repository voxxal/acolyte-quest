import { TicksPerSecond } from "../modlyte";
import { SpellData } from "../spells";

const builder = (level: number): AcolyteFightSpell => {
  let spell: AcolyteFightSpell = {
    id: "teleport",
    name: `Teleport [Lvl ${level}]`,
    description: "Teleport to a nearby location. Get close, or get away.",

    effects: [
      {
        icon: "fas fa-briefcase-medical",
        title: "Cleanse",
        text: "Clears all positive and negative effects.",
      },
      {
        icon: "fas fa-clock",
        title: "Void recharge",
        text: "Cools down 2x faster when in the void.",
      },
    ],

    range: 0.15 + 0.005 * level,
    maxAngleDiffInRevs: 1.0,
    cooldown: 12 * TicksPerSecond,
    throttle: false,
    debuff: true,
    chargeTicks: Math.max(0, 20 - level * 0.5),
    movementProportionWhileCharging: 0.5,

    icon: "teleport",

    color: "#6666ff",

    action: "teleport",
    sound: "teleport",

    buffs: [],
  };

  if (level < 30) {
    spell.effects.unshift({
      icon: "fas fa-heartbeat",
      title: "Weak",
      text: `For ${
        1.5 - 0.05 * level
      } seconds after teleporting, you will only deal 25% damage and cannot deal fatal damage.`,
    });

    spell.buffs.push({
      owner: true,
      type: "lifeSteal",
      maxTicks: (1.5 - 0.05 * level) * TicksPerSecond,
      damageMultiplier: 0.25,
      minHealth: 1,
      decay: true,
    });
  }

  return spell;
};

export const teleport: SpellData = {
  name: "Teleport",
  slot: "a",
  unlockLevel: 6,
  builder,
  scaling: (level: number) => 13 * level + 0.13 * level ** 2,
  maxLevel: 50,
};

import { TicksPerSecond } from "../../src/modlyte";

export const voidRush = (level: number): Spell => {
  let spell: Spell = {
    id: "voidRush",
    name: "Void Rush",
    description: "",
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

    untargeted: true,
    maxAngleDiffInRevs: 1.0,
    cooldown: 10 * TicksPerSecond,
    throttle: false,
    debuff: true,

    buffs: [
      {
        type: "movement",
        movementProportion: 1.5 + level * 0.02,
        maxTicks: 3 * TicksPerSecond,
      },
      {
        type: "cooldown",
        cooldownRateModifier: -1,
        spellId: "voidRush",
        maxTicks: 3 * TicksPerSecond,
      },
      {
        type: "armor",
        proportion: -0.5 - level * 0.02,
        source: "lava",
        maxTicks: 3 * TicksPerSecond,
        sound: "voidRush-lavaImmunity",
        render: {
          color: "#8800ff",
          heroColor: true,
          ticks: 60,
          emissionRadiusFactor: 0,
          particleRadius: 0.0135,
          decay: true,
          alpha: 0.3,
          light: 0.8,
          glow: 0.7,
          shine: 0.5,
          bloom: 0.03,
          vanish: 1,
        },
      },
    ],

    icon: "sprint",
    color: "#8800ff",
    action: "buff",
  };
  if (level < 25) {
    spell.description = `For 3 seconds, increase movement speed ${
      50 + level * 2
    }%, and also ${
      level < 25
        ? `take ${50 + level * 2} less damage from the void.`
        : level === 25
        ? "become immune to damage from the void."
        : `heal ${(level - 25) * 2} of damage delt from the void.`
    }`;
  }
  
  return spell;
};

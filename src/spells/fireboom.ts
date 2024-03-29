import { Categories, GraphicsLevel, TicksPerSecond } from "../modlyte";
import { SpellData } from "../spells";

const builder = (level: number): AcolyteFightSpell => ({
  id: "fireboom",
  name: `Fireboom [Lvl ${level}]`,
  description:
    "It's slower than fireball - harder to aim, but does more damage. Takes 0.5 seconds to grow to full damage, so keep a little bit of distance for maximum effect.",
  action: "projectile",

  color: "#ff4400",
  icon: "burningDot",

  maxAngleDiffInRevs: 0.01,
  cooldown: 1.5 * TicksPerSecond,
  throttle: true,

  projectile: {
    density: 5,
    radius: 0.005,
    speed: 0.23,
    maxTicks: 2 * TicksPerSecond,
    damage: 0,
    categories: Categories.Projectile,
    expireAfterCursorTicks: 0,

    detonate: {
      damage: 20 + level,
      radius: 0.030 + Math.floor(level / 5),
      minImpulse: 0.00015,
      maxImpulse: 0.00015,

      renderTicks: 10,
    },

    partialDetonateRadius: {
      initialMultiplier: 0.2,
      ticks: 1 * TicksPerSecond,
    },

    partialDamage: {
      initialMultiplier: 0.67,
      ticks: 0.5 * TicksPerSecond,
    },

    sound: "flamestrike",
    color: "#ff4400",
    renderers: [
      { type: "bloom" },
      {
        type: "reticule",
        color: "rgba(128, 32, 0, 0.1)",
        radius: 0.04,
        minRadius: 0.030 + Math.floor(level / 5),
        usePartialDamageMultiplier: true,
      },
      {
        type: "projectile",
        ticks: 4,
        vanish: 1,
        minGraphics: GraphicsLevel.Medium,
      },
      { type: "projectile", ticks: 18, smoke: 0.4, fade: "#333" },
      { type: "ray", ticks: 18 },
      { type: "strike", ticks: 18, flash: true, numParticles: 5 },
    ],
  },
});

export const fireboom: SpellData = {
  name: "Fireboom",
  slot: "q",
  unlockLevel: 4,
  builder,
  scaling: (level: number) => 10 * level + 0.1 * level ** 2,
  maxLevel: 50,
};

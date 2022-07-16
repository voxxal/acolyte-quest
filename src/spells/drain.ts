import { GraphicsLevel, TicksPerSecond } from "../modlyte";
import { SpellData } from "../spells";

const builder = (level: number): AcolyteFightSpell => ({
  id: "drain",
  name: `Drain [Lvl ${level}]`,
  description:
    "Steal some life from your enemy. They probably didn't need it anyway.",
  action: "projectile",

  color: "#22ee88",
  icon: "energyBreath",

  maxAngleDiffInRevs: 0.01,
  cooldown: 5 * TicksPerSecond,
  throttle: true,

  projectile: {
    sound: "drain",

    density: 2,
    radius: 0.002,
    speed: 0.2,
    maxTicks: 2.0 * TicksPerSecond,
    damage: 8 + 1.25 * level,
    lifeSteal: Math.min(1, 0.75 + 0.02 * level),

    behaviours: [
      {
        type: "homing",
        targetType: "enemy",
        trigger: { atCursor: true },
        newSpeed: 0.10 + 0.02 * level,
        redirect: true,
      },
    ],

    color: "#22ee88",
    renderers: [
      { type: "bloom" },
      {
        type: "projectile",
        ticks: 5,
        vanish: 1,
        light: 0.8,
        minGraphics: GraphicsLevel.Medium,
      },
      { type: "projectile", ticks: 15, vanish: 1, light: 0.5 },
      {
        type: "ray",
        intermediatePoints: true,
        radiusMultiplier: 0.25,
        ticks: 45,
        vanish: 1,
        light: 0.8,
      },
      { type: "strike", ticks: 30, growth: 2, flash: true, numParticles: 4 },
    ],
  },
});

export const drain: SpellData = {
    name: "Drain",
    slot: "w",
    unlockLevel: 7,
    builder,
    scaling: (level: number) => 13 * level + 0.13 * level ** 2,
    maxLevel: 50,
}
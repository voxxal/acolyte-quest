import { Categories, TicksPerSecond } from "../modlyte";
import { SpellData } from "../spells";

const builder = (level: number): AcolyteFightSpell => ({
  id: "repulsor",
  name: `Repulsor [Lvl ${level}]`,
  description:
    "Huge knockback, if your aim is good enough. Beware, the recoil from Repulsor knocks you back too.",
  action: "projectile",

  color: "#00ddff",
  icon: "lightningHelix",

  maxAngleDiffInRevs: 0.01,
  cooldown: 9 * TicksPerSecond,
  throttle: true,
  chargeTicks: 0.1 * TicksPerSecond,
  recoil: 0.5 - level * 0.01,

  projectile: {
    density: 11,
    radius: 0.0025,
    speed: 1.0 + level * 0.05,
    maxTicks: 1 * TicksPerSecond,
    collideWith: Categories.All,
    swappable: false,
    damage: 0,

    sound: "lightning",
    color: "#00ddff",
    renderers: [
      { type: "bloom", radius: 0.05 },
      {
        type: "ray",
        intermediatePoints: true,
        ticks: Math.floor((level + 10) / 2),
        vanish: 1,
      },
      {
        type: "strike",
        ticks: 15,
        flash: true,
        detonate: 0.01,
        numParticles: 5,
        speedMultiplier: 0.2,
      },
    ],
  },
});

export const repulsor: SpellData = {
  name: "Repulsor",
  slot: "w",
  unlockLevel: 5,
  builder,
  scaling: (level: number) => 10 * level + 0.1 * level ** 2,
  maxLevel: 50,
};

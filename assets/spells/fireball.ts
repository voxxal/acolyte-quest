import { Categories, TicksPerSecond } from "../../src/modlyte";

export const fireball = (level: number): AcolyteFightSpell => {
  return {
    id: "fireball",
    name: `Fireball [Lvl ${level}]`,
    description: "Quick cooldown and packs a punch. Good old trusty fireball.",
    action: "projectile",

    color: "#f80",
    icon: "thunderball",

    maxAngleDiffInRevs: 0.01,
    cooldown: 1.5 * TicksPerSecond,
    throttle: true,

    projectile: {
      density: 25,
      radius: 0.003,
      speed: 0.6,
      maxTicks: 1.5 * TicksPerSecond,
      damage: Math.round(16 + 1.025 ** (level * 2)),
      lifeSteal: 0,
      categories: Categories.Projectile,

      sound: "fireball",
      soundHit: "standard",
      color: "#f80",
      renderers: [
        { type: "bloom", radius: 0.045 },
        { type: "projectile", ticks: 30, smoke: 0.05 },
        { type: "ray", ticks: 30 },
        { type: "strike", ticks: 30, flash: true, numParticles: 5 },
      ],
    },
  };
};

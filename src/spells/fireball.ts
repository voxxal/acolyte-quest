import { Categories, TicksPerSecond } from "../modlyte";

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
      damage: 8 + 2 * level,
      lifeSteal: 0,
      categories: Categories.Projectile,

      sound: "fireball",
      soundHit: "standard",
      color: "#f80",
      renderers: [
        {
          type: "bloom",
          radius: 0.01,
        },
        {
          type: "ray",
          ticks: Math.min(20, level),
        },
        {
          type: "projectile",
          ticks: 10,
          smoke: Math.min(0.2, 0.15 + level * 0.0025),
        },
        {
          type: "strike",
          ticks: 30,
          flash: true,
          numParticles: 3,
        },
      ],
    },
  };
};

import { Categories, TicksPerSecond } from "../../modlyte";

export const big: AcolyteFightSpell = {
  id: "safe_big",
  name: "Gluttony",
  description: "DO NOT CHANGE THIS SPELL! YOU WILL NOT BE REWARDED WITH EXP",
  passive: true,
  untargeted: true,
  cooldown: 1,
  buffs: [
    {
      type: "mass",
      radius: 0.0125,
      passive: true,
    },
  ],
  icon: "dodging",
  color: "#6f0",
  action: "buff",
};

export const small: AcolyteFightSpell = {
  id: "ai_small",
  description: "DO NOT USE THIS SPELL! YOU WILL NOT BE REWARDED WITH EXP",
  passive: true,
  untargeted: true,
  cooldown: 1,
  buffs: [
    {
      type: "mass",
      radius: 0.0115,
      passive: true,
    },
  ],
  icon: "dodging",
  color: "#6f0",
  action: "buff",
};

export const dagger: AcolyteFightSpell = {
  id: "ai_dagger",
  description: "DO NOT USE THIS SPELL! YOU WILL NOT BE REWARDED WITH EXP",
  action: "projectile",

  color: "#8f0",
  icon: "thunderball",

  maxAngleDiffInRevs: 0.01,
  cooldown: 1.5 * TicksPerSecond,
  throttle: true,

  projectile: {
    density: 25,
    radius: 0.003,
    speed: 0.6,
    maxTicks: 1.5 * TicksPerSecond,
    damage: 16,
    lifeSteal: 0,
    categories: Categories.Projectile,

    sound: "fireball",
    soundHit: "standard",
    color: "#8f0",
    renderers: [
      {
        type: "bloom",
        radius: 0.01,
      },
      {
        type: "ray",
        ticks: 1,
      },
      {
        type: "projectile",
        ticks: 10,
        smoke: 0.15,
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

export const bow: AcolyteFightSpell = {
  id: "ai_bow",
  description: "DO NOT USE THIS SPELL! YOU WILL NOT BE REWARDED WITH EXP",
  action: "projectile",

  color: "#8f0",
  icon: "lightningHelix",

  maxAngleDiffInRevs: 0.01,
  cooldown: 3 * TicksPerSecond,
  throttle: true,
  chargeTicks: 0.1 * TicksPerSecond,
  recoil: 0.25,

  projectile: {
    density: 3,
    radius: 0.0025,
    speed: 1.5,
    maxTicks: 1 * TicksPerSecond,
    collideWith: Categories.All,
    swappable: false,
    damage: 10,

    sound: "lightning",
    color: "#8f0",
    renderers: [
      { type: "bloom", radius: 0.05 },
      { type: "ray", intermediatePoints: true, ticks: 30, vanish: 1 },
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
};

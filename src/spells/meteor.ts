import { Categories, TicksPerSecond } from "../modlyte";
import { SpellData } from "../spells";

const builder = (level: number): AcolyteFightSpell => ({
  id: "meteor",
  name: `Meteor [Lvl ${level}]`,
  description:
    "Send a giant meteor towards your enemies! Nothing stops a meteor.",
  action: "projectile",

  color: "#ff0000",
  icon: "cometSpark",

  maxAngleDiffInRevs: 0.01,
  cooldown: 9 * TicksPerSecond,
  throttle: true,

  projectile: {
    density: 100,
    ccd: false,
    attractable: false,
    linkable: true,
    swappable: true,
    radius: 0.024 + 0.0004 * level,
    speed: 0.1 + 0.04 * level,
    speedDecayPerTick: 0.2,
    restitution: 0,
    minTicks: 1,
    maxTicks: 2 * TicksPerSecond,
    hitInterval: 120,
    damage: 0,
    shieldTakesOwnership: false,
    categories: Categories.Projectile | Categories.Massive,
    collideWith: Categories.All ^ Categories.Shield, // Shields have no effect on Meteor
    expireOn: Categories.None,

    sound: "meteor",
    color: "#ff0000",
    renderers: [
      { type: "bloom", radius: 0.06 },
      {
        type: "projectile",
        ticks: 18,
        light: null,
        shine: 0,
        smoke: 0.5,
        fade: "#333",
        shadow: 0.5,
      },
      { type: "strike", ticks: 18, flash: true, growth: 0.1 },
    ],
  },
});

export const meteor: SpellData = {
  name: "Meteor",
  slot: "e",
  unlockLevel: 8,
  builder,
  scaling: (level: number) => 14 * level + 0.14 * level ** 2,
  maxLevel: 50,
};

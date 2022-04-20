import { hpToDmgRes, levelToDmgRes, levelToHp } from "../../util/health";

export const playerHealth = (level: number): AcolyteFightSpell => {
  return {
    id: "safe_health",
    name: `${levelToHp(level).toFixed(0)} Health`,
    description: "Your health is based on your level.",
    passive: true,
    untargeted: true,
    cooldown: 1,
    buffs: [
      {
        type: "armor",
        passive: true,
        proportion: levelToDmgRes(level),
      },
    ],
    icon: "hearts",
    color: "#d0021b",
    action: "buff",
  };
};

export const botHealth = (health: number): AcolyteFightSpell => {
  return {
    id: "ai_health",
    description: "DO NOT USE THIS SPELL! YOU WILL NOT BE REWARDED WITH EXP",
    passive: true,
    untargeted: true,
    cooldown: 1,
    buffs: [
      {
        type: "armor",
        passive: true,
        proportion: hpToDmgRes(health),
      },
    ],
    icon: "hearts",
    color: "#d0021b",
    action: "buff",
  };
};

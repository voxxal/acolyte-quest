import { Spell, User } from "@prisma/client";
import { buildModSettings } from "../modlyte";
import { spells } from "../spells";

export const defaultOptions = {
  a: [["thrust"], ["teleport", "swap"], ["voidRush", "vanish"]],
  q: [
    ["fireball", "fireboom"],
    ["difire"],
    ["retractor", "backlash"],
    ["whip", "phaseOrb"],
  ],
  w: [
    ["drain", "boost"],
    ["homing", "boomerang"],
    ["gravity", "whirlwind"],
    ["link", "grapple"],
    ["lightning"],
  ],
  e: [
    ["meteor"],
    ["armor", "horcrux"],
    ["shield", "icewall"],
    ["saber"],
    ["phaseOut", "blaze"],
  ],
  r: [
    ["repeater"],
    ["empower"],
    ["supernova", "rocket"],
    ["kamehameha", "blast"],
  ],
  f: [["mines"], ["bump", "scourge"], ["firespray", "iceBomb"], ["halo"]],
};
// TODO probably a better way of doing this
export const buildMod = (
  player: User & {
    spells: Spell[];
  },
  ai: string = "const act = () => null; return { act };"
) => {
  let foundSlots = {
    a: false,
    q: false,
    w: false,
    e: false,
    r: false,
    f: false,
  };

  const mod: AcolyteFightMod = {
    Mod: buildModSettings({
      name: "Acolyte Quest",
      author: "voxal",
      description: "QUEST: something or idk",
      subtitle: ["Goblin", "Hideout"],
    }),
    Spells: {},
    Choices: {
      Keys: [],
      Options: {},
      Special: {
        move: "move",
        retarget: "retarget",
        s: "stop",
      },
    },

    Code: "const act = () => null; return { act };",
  };

  player.spells.forEach((spell) => {
    const spellData = spells.get(spell.id);
    foundSlots[spellData.slot] = true;
    mod.Spells[spell.id] = spellData.builder(spell.level);
  });

  for (const [slot, bool] of Object.entries(foundSlots)) {
    if (bool)
      mod.Choices.Keys.push({
        btn: slot,
        barSize: slot === "a" || slot === "f" ? 0.75 : 1,
        wheelSize: slot === "a" || slot === "f" ? 0.5 : 1,
      });
    if (slot === "a" && foundSlots.q) mod.Choices.Keys.push(null);
    if (slot === "r" && foundSlots.f) mod.Choices.Keys.push(null);
  }
  for (const [key, slot] of Object.entries(defaultOptions)) {
    if (foundSlots[key]) mod.Choices.Options[key] = [];
    else continue;
    for (const column of slot) {
      let row = [];
      for (const spellId of column) {
        if (player.spells.find((spell) => spell.id === spellId) !== undefined) {
          row.push(spellId);
        }
      }
      if (row.length > 0) mod.Choices.Options[key].push(row);
    }
  }
  return mod;
};

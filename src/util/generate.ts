import { Spell, User } from "@prisma/client";
import { buildModSettings } from "../modlyte";
import { QuestData, quests } from "../quests";
import { spells } from "../spells";
import { spellsMap } from "./spells";
import * as fs from "fs/promises";
import { botHealth, playerHealth } from "../spells/generic/health";

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
    ["repulsor"],
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
export const buildMod = async (
  player: User & {
    spells: Spell[];
  },
  quest: string
) => {
  let foundSlots = {
    a: false,
    q: false,
    w: false,
    e: false,
    r: false,
    f: false,
  };
  const questData = quests.get(quest);

  const mod: AcolyteFightMod = {
    Mod: buildModSettings({
      name: "Acolyte Quest",
      author: "voxal",
      description: "",
      subtitle: questData.name.split(" "),
    }),
    Icons: {},
    Spells: {},
    Choices: {
      Keys: [],
      Options: {},
    },
    Code: (await fs.readFile(`./src/ai/${questData.ai}.js`)).toString(),
  };

  // Add health spells
  mod.Choices.Keys.push({ btn: "health", barSize: 0.5, wheelSize: 0.25 });
  mod.Spells.safe_health = playerHealth(player.level);
  mod.Spells.ai_health = botHealth(questData.botHp);
  mod.Choices.Options["health"] = [["safe_health"], ["ai_health"]];
  mod.Icons.hearts = {
    path: "M480.25 156.355c0 161.24-224.25 324.43-224.25 324.43S31.75 317.595 31.75 156.355c0-91.41 70.63-125.13 107.77-125.13 77.65 0 116.48 65.72 116.48 65.72s38.83-65.73 116.48-65.73c37.14.01 107.77 33.72 107.77 125.14z",
    credit: "https://game-icons.net/1x1/skoll/hearts.html",
  };

  player.spells.forEach((spell) => {
    const spellData = spells.get(spell.id);
    foundSlots[spellData.slot] = true;
    mod.Spells[spell.id] = spellData.builder(spell.level);
  });

  // Find the slots that don't exist and don't add them as a button
  for (const [slot, found] of Object.entries(foundSlots)) {
    if (found)
      mod.Choices.Keys.push({
        btn: slot,
        barSize: slot === "a" || slot === "f" ? 0.75 : 1,
        wheelSize: slot === "a" || slot === "f" ? 0.5 : 1,
      });
    if (slot === "a" && foundSlots.q) mod.Choices.Keys.push(null);
    if (slot === "r" && foundSlots.f) mod.Choices.Keys.push(null);
  }
  const spellsObject = spellsMap(player.spells);
  // Iterate over and build the options
  for (const [key, slot] of Object.entries(defaultOptions)) {
    if (foundSlots[key]) mod.Choices.Options[key] = [];
    else mod.Choices.Options[key] = { $delete: true } as any;
    for (const column of slot) {
      let row = [];
      for (const spellId of column) {
        if (spellsObject[spellId] !== undefined) {
          row.push(spellId);
        }
      }
      if (row.length > 0) mod.Choices.Options[key].push(row);
    }
  }

  // Add Quest data
  for (const slot in questData.spells) {
    mod.Choices.Keys.push({
      btn: `attack${slot}`,
      barSize: 0.0000001,
      wheelSize: 0.0000001,
    });
    mod.Choices.Options[`attack${slot}`] = [
      questData.spells[slot].map((spell) => spell.id),
    ];

    for (const spell of questData.spells[slot]) {
      mod.Spells[spell.id] = spell;
    }
  }

  Object.assign(mod, questData.options);

  return mod;
};

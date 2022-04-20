import { Command, CommandContext } from ".";
import * as puppeteer from "puppeteer";
import prisma from "../prisma";
import { buildMod } from "../util/generate";
import { grantPlayerExp, grantSpellExp } from "../util/level";
import {
  MessageActionRow,
  MessageButton,
  MessageEmbedOptions,
} from "discord.js";
import { createParty, uploadMod } from "../util/puppeteer";
import { spells } from "../spells";
import { grantSpell, spellsMap } from "../util/spells";
import { Spell, User } from "@prisma/client";
import { randInt } from "../util/random";
import { levelToHp } from "../util/health";
//TODO move this out
export interface GameStatsMsg {
  gameId: string;
  partyId: string;
  category: string;
  unixTimestamp: number;
  winner: string; // userHash
  winners: string[]; // user hashes
  lengthSeconds: number;
  players: PlayerStatsMsg[];
  server: string;
}

export interface PlayerStatsMsg {
  userId?: string;
  userHash: string;
  teamId?: string;
  name: string;
  kills: number;
  outlasts: number;
  damage: number;
  rank: number;
  ticks: number;

  spellIds?: string[];
}

interface QuestResult {
  playerExpGained: number;
  spellExpGained: { id: string; gain: number }[];
}

const questComplete = (gameStats: GameStatsMsg): QuestResult => {
  const expGained = randInt(10, 15);
  const loadout = gameStats.players[0].spellIds.filter(
    (id) => !id.startsWith("safe")
  );
  return {
    playerExpGained: expGained,
    spellExpGained: loadout.map((id) => {
      return {
        id,
        gain: expGained / loadout.length,
      };
    }),
  };
};

const applyChanges = async (
  player: User & {
    spells: Spell[];
  },
  questResult: QuestResult
) => {
  const levelUp = await grantPlayerExp(
    prisma,
    player.id,
    questResult.playerExpGained
  );
  const newLevel = player.level + levelUp;
  let spellLevelUp: { spellId: string; value: number }[] = [];

  for (const { id, gain } of questResult.spellExpGained) {
    let spellLeveledUp = await grantSpellExp(prisma, player.id, id, gain);
    if (spellLeveledUp)
      spellLevelUp.push({ spellId: id, value: spellLeveledUp });
  }
  let embeds: MessageEmbedOptions[] = [
    {
      title: "QUEST COMPLETE!",
      color: "GREEN",
      description: `**Rewards:**
      Player: ${questResult.playerExpGained.toFixed(1)} Exp
      ${questResult.spellExpGained
        .map(({ id, gain }) => `${spells.get(id).name}: ${gain.toFixed(1)} Exp`)
        .join("\n")}`,
    },
  ];
  const spellsObject = spellsMap(player.spells);

  if (levelUp) {
    let unlockedSpells = [];
    for (const [spellId, spell] of spells.entries()) {
      if (
        newLevel >= spell.unlockLevel &&
        spellsObject[spellId] === undefined
      ) {
        unlockedSpells.push(spellId);
        await grantSpell(prisma, player.id, spellId);
      }
    }
    embeds.push({
      title: "LEVEL UP!",
      color: "ORANGE",
      description: `${player.level} -> ${newLevel}
      **Health** ${levelToHp(player.level).toFixed(0)} -> ${levelToHp(
        newLevel
      ).toFixed(0)}
      ${unlockedSpells
        .map((s) => `**UNLOCKED SPELL!** ${spells.get(s).name}`)
        .join("\n")}`,
    });
  }
  if (spellLevelUp.length > 0)
    embeds.push({
      title: "SPELL LEVEL UP!",
      color: "PURPLE",
      description: spellLevelUp
        .map(({ spellId, value }) => {
          const oldSpell = spellsObject[spellId]; // probably build a map of spells
          return `**${spells.get(spellId).name}** ${oldSpell.level} -> ${
            oldSpell.level + value
          }`;
        })
        .join("\n"),
    });

  return embeds;
};
// TODO make a rematch/try again button by passing in the reply context or something
export class QuestCommand implements Command {
  readonly name = "quest";
  readonly description = "Go on a quest";

  async execute({ client, message }: CommandContext) {
    const player = await prisma.user.findUnique({
      where: { id: BigInt(message.author.id) },
      include: { spells: true },
    });
    //TODO prevent them from creating a new instance if one already exists
    if (player.lastQuest.getTime() + 30_000 > Date.now()) {
      await message.reply({
        embeds: [
          {
            title: "QUEST",
            description: `You've quested too recently! Please wait ${(
              (player.lastQuest.getTime() + 30_000 - Date.now()) /
              1000
            ).toFixed(0)} seconds before questing again.`,
          },
        ],
      });
      return;
    }

    if (client.instances.has(player.id)) {
      await message.reply({
        embeds: [
          {
            title: "QUEST",
            description: `An instances already exists for you. wait for that one to expire before starting a new one.`,
          },
        ],
      });
      return;
    }
    const reply = await message.reply({
      embeds: [
        {
          title: "QUEST",
          description: "Hang Tight! Your quest is getting built!",
        },
      ],
    });

    const mod = await buildMod(player, "goblinHideout");
    // Puppet stuff
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let endedPrematurely = false;
    page.on("console", async (msg) => {
      if (msg.text().toLowerCase().includes("received final game results")) {
        const matchResult: GameStatsMsg = await msg.args()[1].jsonValue();
        // Cheat detection
        if (matchResult.players[0].spellIds.join(",").includes(",ai_")) {
          reply.edit({
            components: [],
            embeds: [
              {
                title: "QUEST FAILED",
                color: "RED",
                description:
                  "You used an AI spell and got nothing from this quest.",
              },
            ],
          });
          return;
        }

        const rewards = questComplete(matchResult);
        const embeds = await applyChanges(player, rewards);

        reply.edit({
          components: [],
          embeds,
        });

        endedPrematurely = true;
        collector.stop();
      } else if (msg.text().toLowerCase().includes("killed at")) {
        const [, name, , tick] = msg.text().split(" ");
        if (name !== mod.World.BotName) {
          reply.edit({
            components: [],
            embeds: [
              {
                title: "QUEST FAILED",
                color: "RED",
                description: "You died on your quest :(",
              },
            ],
          });
          endedPrematurely = true;
          collector.stop();
        }
      }
    });

    client.instances.set(player.id, {
      browser,
      started: new Date(),
      owner: player.id,
      quest: "goblinHideout",
    });

    await uploadMod(page, mod);

    // Navigate to party
    await page.waitForSelector('a[href="party"]');
    await page.click('a[href="party"]');

    const url = await createParty(page);

    // Return home
    await page.click("a.nav-item");
    await page.waitForSelector("input");
    // Change Name
    await page.click("input", { clickCount: 3 });
    await page.type("input", "Acolyte Quest");
    // Navigate to watch

    await page.click("span.btn");

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("close")
        .setLabel("Surrender")
        .setStyle("DANGER")
        .setEmoji("🏳️")
    );

    //TODO maybe dm, or migrate to slash comamnds, lazy -_-
    await reply.edit({
      embeds: [
        {
          title: "QUEST",
          description: `Join the party and play against bots -> ${url}`,
        },
      ],
      components: [row],
    });

    const collector = message.channel.createMessageComponentCollector({
      filter: (i) => i.customId === "close" && i.user.id === message.author.id,
      time: 300000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "close") {
        await i.update({
          components: [],
          embeds: [
            {
              title: "QUEST FAILED",
              color: "RED",
              description: "You surrendered.",
            },
          ],
        });
        endedPrematurely = true;
        collector.stop();
      }
    });

    collector.on("end", async (collected) => {
      if (!endedPrematurely)
        await reply.edit({
          components: [],
          embeds: [
            {
              title: "QUEST FAILED",
              color: "RED",
              description: "Your instance timed out.",
            },
          ],
        });

      await prisma.user.update({
        where: { id: player.id },
        data: { lastQuest: new Date(), totalQuests: player.totalQuests + 1 },
      });
      await browser.close();
      client.instances.delete(player.id);
    });
  }
}

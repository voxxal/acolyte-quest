import { Command, CommandContext } from ".";
import * as puppeteer from "puppeteer";
import { modToFile } from "../modlyte";
import prisma from "../prisma";
import { buildMod } from "../util/generate";
import { grantPlayerExp, grantSpellExp } from "../util/level";
import {
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  MessageEmbedOptions,
} from "discord.js";
import * as fs from "fs/promises";
import { createParty, uploadMod } from "../util/puppeteer";
import { spells } from "../spells";
import { grantSpell, spellsMap } from "../util/spells";
import { Spell, User } from "@prisma/client";
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
  const loadout = gameStats.players[0].spellIds;
  return {
    playerExpGained: 10,
    spellExpGained: loadout.map((id) => ({ id, gain: 10 / loadout.length })),
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
      description: `**Rewards:**
      Player: ${questResult.playerExpGained} Exp
      ${questResult.spellExpGained
        .map(({ id, gain }) => `${spells.get(id).name}: ${gain} Exp`)
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

export class QuestCommand implements Command {
  readonly name = "quest";
  readonly description = "Go on a quest";

  async execute({ client, message }: CommandContext) {
    const player = await prisma.user.findUnique({
      where: { id: BigInt(message.author.id) },
      include: { spells: true },
    });

    const reply = await message.reply({
      embeds: [
        {
          title: "QUEST",
          description: "Hang Tight! Your quest is getting built!",
        },
      ],
    });

    const mod = buildMod(player);
    // Puppet stuff
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let endedPrematurely = false;
    page.on("console", async (msg) => {
      if (msg.text().toLowerCase().includes("received final game results")) {
        const questResult = questComplete(await msg.args()[1].jsonValue());
        const embeds = await applyChanges(player, questResult);

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
                description: "You died on your quest :(",
              },
            ],
          });
          endedPrematurely = true;
          collector.stop();
        }
      }
    });
    // TODO extract into another function
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
          embeds: [{ title: "QUEST FAILED", description: "You surrendered." }],
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
            { title: "QUEST FAILED", description: "Your instance timed out." },
          ],
        });
      await browser.close();
    });
  }
}

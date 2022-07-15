import { Command, CommandContext } from ".";
import * as puppeteer from "puppeteer";
import prisma from "../prisma";
import { buildMod } from "../util/generate";
import { grantPlayerExp, grantSpellExp } from "../util/level";
import {
  ApplicationCommandOptionData,
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
import { QuestData, quests } from "../quests";
import { failWith } from "../util/quest";
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

// TODO variance exp gain per spell and don't use a fixed exp gained
const questComplete = (
  quest: QuestData,
  gameStats: GameStatsMsg
): QuestResult => {
  const expGained = randInt(quest.expGained[0], quest.expGained[1]);
  const loadout = gameStats.players[0].spellIds.filter(
    (id) => !id.startsWith("safe")
  );
  return {
    playerExpGained: expGained,
    spellExpGained: loadout.map((id) => ({
      id,
      gain: expGained / loadout.length,
    })),
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
  await prisma.user.update({
    where: { id: player.id },
    data: { lastQuest: new Date(), wonQuests: player.wonQuests + 1 },
  });
  return embeds;
};
// TODO make a rematch/try again button by passing in the reply context or something
export class QuestCommand implements Command {
  readonly name = "quest";
  readonly description = "Go on a quest";
  readonly options: ApplicationCommandOptionData[] = [
    {
      type: "STRING",
      name: "quest",
      choices: Array.from(quests.entries(), ([id, quest]) => ({
        name: quest.name,
        value: id,
      })),
      description: "The quest that you are going on",
      required: true,
    },
  ];

  async execute({ client, interaction }: CommandContext) {
    const player = await prisma.user.findUnique({
      where: { id: BigInt(interaction.user.id) },
      include: { spells: true },
    });
    const questName = interaction.options.get("quest").value as string;
    const quest = quests.get(questName);

    if (player.lastQuest.getTime() + 10_000 > Date.now()) {
      await interaction.reply({
        embeds: [
          {
            title: "QUEST",
            description: `You've quested too recently! Please wait ${(
              (player.lastQuest.getTime() + 10_000 - Date.now()) /
              1000
            ).toFixed(0)} seconds before questing again.`,
          },
        ],
        ephemeral: true,
      });
      return;
    }

    if (client.instances.has(player.id)) {
      await interaction.reply({
        embeds: [
          {
            title: "QUEST",
            description: `An instances already exists for you. wait for that one to expire before starting a new one.`,
          },
        ],
        ephemeral: true,
      });
      return;
    }

    if (player.level < quest.unlockLevel) {
      await interaction.reply({
        embeds: [
          {
            title: "QUEST",
            description: `You're too low level for this quest! Level up and try again.`,
          },
        ],
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      embeds: [
        {
          title: "QUEST",
          description: "Hang Tight! Your quest is getting built!",
        },
      ],
      ephemeral: true,
    });

    const mod = await buildMod(player, quest);
    // Puppet stuff
    const browser = await client.browser();
    const page = await browser.newPage();
    let matchResult: GameStatsMsg | null = null;
    page.on("console", async (msg) => {
      if (msg.text().toLowerCase().includes("received final game results")) {
        matchResult = await msg.args()[1].jsonValue();
        // Cheat detection
        if (matchResult.players[0].spellIds.join(",").includes(",ai_")) {
          collector.stop("aiSpell");
          return;
        }

        collector.stop("win");
      } else if (msg.text().toLowerCase().includes("killed at")) {
        const [, name, , tick] = msg.text().split(" ");
        if (name !== mod.World.BotName) collector.stop("death");
      }
    });

    client.instances.set(player.id, {
      page,
      started: new Date(),
      owner: player.id,
      quest: questName,
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

    await interaction.editReply({
      embeds: [
        {
          title: "QUEST",
          description: `Join the party and play against bots -> ${url}`,
        },
      ],
      components: [row],
    });

    const collector = interaction.channel.createMessageComponentCollector({
      filter: (i) =>
        i.customId === "close" && i.user.id === interaction.user.id,
      time: 300000,
    });

    collector.on("collect", async _ => collector.stop("surrender"));

    collector.on("end", async (collected, reason) => {
      let embeds = [];
      switch (reason) {
        case "win":
          const rewards = questComplete(quest, matchResult);
          embeds = await applyChanges(player, rewards);
          break;
        case "surrender":
          embeds = failWith("You surrendered.");
          break;
        case "death":
          embeds = failWith("You died on your quest :(");
        case "aiSpell":
          embeds = failWith(
            "You used an AI spell and got nothing from this quest."
          );
          break;
        case null:
          embeds = failWith("Your instance timed out.");
          break;
      }

      await interaction.editReply({
        components: [],
        embeds,
      });

      await prisma.user.update({
        where: { id: player.id },
        data: { lastQuest: new Date(), totalQuests: player.totalQuests + 1 },
      });

      await page.close();
      client.instances.delete(player.id);
    });
  }
}

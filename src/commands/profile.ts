import {
  APIEmbed,
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  Embed,
  EmbedData,
} from "discord.js";
import { Command, CommandContext } from ".";
import prisma from "../prisma";
import { spells } from "../spells";
import {
  expProgressLevelPlayer,
  expForLevelPlayer,
  MAX_PLAYER_EXPERIENCE,
  expProgressLevelSpell,
  totalExpForLevelSpell,
} from "../util/level";

export class ProfileCommand implements Command {
  readonly name = "profile";
  readonly description = "Displays players profile";
  readonly options: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionType.User,
      name: "user",
      description: "Which user's profile",
    },
  ];

  async execute({ client, interaction }: CommandContext) {
    const options = interaction.options;
    const user = interaction.options.get("user")?.user ?? interaction.user;
    const player = await prisma.user.findUnique({
      where: {
        id: BigInt(user.id),
      },
      include: { spells: true },
    });

    if (player === null) {
      await interaction.reply("Player doesn't exist");
      return;
    }

    const embed: APIEmbed = {
      title: user.username,
      //   description: "Some description here",
      thumbnail: {
        url: user.displayAvatarURL({ size: 256 }),
      },
      fields: [
        {
          name: "Level",
          value: `Level ${player.level} (${
            player.experience === MAX_PLAYER_EXPERIENCE
              ? "MAXED"
              : `${expProgressLevelPlayer(
                  player.level,
                  player.experience
                ).toFixed(1)}/${expForLevelPlayer(player.level).toFixed(1)}`
          })`,
          inline: true,
        },
        {
          name: "Total Experience",
          value: player.experience.toFixed(1),
          inline: true,
        },
        {
          name: "Spells",
          value:
            player.spells.length > 0
              ? player.spells
                  .map(
                    (spell) =>
                      `${spells.get(spell.id).name} [Lvl ${spell.level}] (${
                        spell.experience ===
                        totalExpForLevelSpell(
                          spell.id,
                          spells.get(spell.id).maxLevel
                        )
                          ? "MAXED"
                          : `${expProgressLevelSpell(
                              spell.id,
                              spell.level,
                              spell.experience
                            ).toFixed(1)}/${spells
                              .get(spell.id)
                              .scaling(spell.level)
                              .toFixed(1)}`
                      })`
                  )
                  .join("\n")
              : "Nothing Here",
        },
        {
          name: "Date Created",
          value: player.createdAt.toDateString(),
        },
      ],
      timestamp: new Date().toString(),
      footer: {
        text: "Acolyte Quest",
        icon_url: client.user?.displayAvatarURL({ size: 256 }),
      },
    };

    await interaction.reply({ embeds: [embed] });
  }
}

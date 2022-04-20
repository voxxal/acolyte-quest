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
  readonly description = "Displays your profile";

  async execute({ client, message }: CommandContext) {
    const player = await prisma.user.findUnique({
      where: { id: BigInt(message.author.id) },
      include: { spells: true },
    });

    if (player === null) {
      await message.reply("Something went wrong");
      return;
    }

    const embed = {
      title: message.author.username,
      //   description: "Some description here",
      thumbnail: {
        url: message.author.displayAvatarURL({ size: 256, dynamic: true }),
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
                        spell.experience === totalExpForLevelSpell(spell.id, spells.get(spell.id).maxLevel)
                          ? "MAXED"
                          : `${expProgressLevelSpell(
                              spell.id,
                              spell.level,
                              spell.experience
                            ).toFixed(1)}/${spells.get(spell.id).scaling(spell.level).toFixed(1)}`
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
      timestamp: new Date(),
      footer: {
        text: "Acolyte Quest",
        icon_url: client.user?.displayAvatarURL({ size: 256, dynamic: true }),
      },
    };

    await message.reply({ embeds: [embed] });
  }
}

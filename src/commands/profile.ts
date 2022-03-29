import { Command, CommandContext } from ".";
import prisma from "../prisma";

export class ProfileCommand implements Command {
  readonly name = "profile";
  readonly description = "Displays your profile";

  async execute({ client, message }: CommandContext) {
    const player = await prisma.user.findUnique({
      where: { id: BigInt(message.author.id) },
    });

    if (player === null) {
      message.reply("Something went wrong");
      return;
    }

    const embed = {
      color: message.author.accentColor ?? undefined,
      title: message.author.username,
      //   description: "Some description here",
      thumbnail: {
        url: message.author.displayAvatarURL({ size: 256, dynamic: true }),
      },
      fields: [
        {
          name: "Level",
          value: `Level ${player.level} (0/0)`,
          inline: true,
        },
        {
          name: "Total Experience",
          value: player.experience.toString(),
          inline: true,
        },
        {
          name: "Date Created",
          value: player.createdAt.toDateString(),
        },
      ],
      timestamp: (new Date()).toDateString(),
      footer: {
        text: "Acolyte Quest",
        icon_url: client.user?.displayAvatarURL({ size: 256, dynamic: true }),
      },
    };

    message.channel.send({ embeds: [embed] });
  }
}

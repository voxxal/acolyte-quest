import { Command, CommandContext } from ".";
import { modToBuffer } from "../modlyte";
import prisma from "../prisma";
import { buildMod } from "../util/generate";
import { grantPlayerExp } from "../util/level";

export class QuestCommand implements Command {
  readonly name = "quest";
  readonly description = "Go on a quest";

  async execute({ client, message }: CommandContext) {
    const player = await prisma.user.findUnique({
      where: { id: BigInt(message.author.id) },
      include: { spells: true },
    });

    const mod = buildMod(player);

    let levelUp = await grantPlayerExp(prisma, BigInt(message.author.id), 10000000);

    await message.reply({
      files: [{ attachment: modToBuffer(mod), name: "mod.json" }],
      embeds: levelUp
        ? [
            {
              title: "LEVEL UP!",
              color: "ORANGE",
              description: `${player.level} -> ${player.level + levelUp}`,
            },
          ]
        : null,
      content: "There are no quests for now. you gain 10 free exp",
    });
  }
}

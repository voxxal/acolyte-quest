import { Command, CommandContext } from ".";
import { modToBuffer } from "../modlyte";
import prisma from "../prisma";
import { buildMod } from "../util/generate";

export class GenerateCommand implements Command {
  readonly name = "generate";
  readonly description = "Generates a mod based on your stats";

  async execute({ client, message }: CommandContext) {
    const player = await prisma.user.findUnique({
      where: { id: BigInt(message.author.id) },
      include: { spells: true },
    });

    const mod = buildMod(player);
    
    await message.reply({
      files: [{ attachment: modToBuffer(mod), name: "mod.json" }],
    });
  }
}

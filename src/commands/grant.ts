import { Command, CommandContext } from ".";
import prisma from "../prisma";
import { spells } from "../spells";
import { grantPlayerExp, grantSpellExp } from "../util/level";
import { grantSpell } from "../util/spells";

export class GrantCommand implements Command {
  readonly name = "grant";
  readonly description = "Grants you stats (admin only i hope)";
  // readonly arguments = [ajerhjaewk]

  async execute({ client, message }: CommandContext) {
    const [command, target, resource, ...args] = message.content.split(" ");
    if (message.author.id !== "290952090560364545") {
      await message.reply("This is an admin only command.");
      return;
    }
    let playerId = BigInt(target.replace("<@!", "").replace(">", ""));

    const player = await prisma.user.findUnique({
      where: { id: playerId },
    });

    if (player === null) {
      await message.reply("Something went wrong");
      return;
    }

    switch (resource) {
      case "spell": {
        const [spellId] = args;
        await grantSpell(prisma, playerId, spellId);
        await message.reply(`Granted <@!${playerId}> spell ${spells.get(spellId).name}`)
      }
      break;
      case "playerExp":
        {
          const [amount] = args;
          await grantPlayerExp(prisma, playerId, parseFloat(amount));
          await message.reply(`Granted <@!${playerId}> ${amount} player exp`);
        }
        break;
      case "spellExp":
        {
          const [spellId, amount] = args;
          await grantSpellExp(prisma, playerId, spellId, parseFloat(amount));
          await message.reply(`Granted <@!${playerId}>'s ${spells.get(spellId).name} ${amount} spell exp`)
        }
        break;
    }
  }
}

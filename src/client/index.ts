import { Client, Collection, Intents } from "discord.js";
import { Command, commands } from "../commands";
import prisma from "../prisma";

export class AcolyteQuestClient extends Client {
  readonly commands = new Collection<string, Command>();

  constructor(options?: Object) {
    super({
      ...options,
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGES,
      ],
    });

    // load default commands
    commands.forEach((cmd: Command) => this.commands.set(cmd.name, cmd));

    this.on("message", async (message) => {
      if (message.author.bot) return;
      if (!message.content.startsWith(process.env.PREFIX || "]")) return;

      if (
        (await prisma.user.count({
          where: { id: BigInt(message.author.id) },
        })) === 0
      ) {
        await prisma.user.create({ data: { id: BigInt(message.author.id) } });
      }
      let command = message.content.split(" ")[0];
      command = command.substring(1);
      console.log(`Executing command ${command}`);
      this.commands.get(command)?.execute({ client: this, message });
    });
  }
}

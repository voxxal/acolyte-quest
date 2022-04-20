import { Client, Collection, Intents } from "discord.js";
import { Browser } from "puppeteer";
import { Command, commands } from "../commands";
import prisma from "../prisma";
import { spells } from "../spells";
import { grantSpell, spellsMap } from "../util/spells";

export interface InstanceData {
  owner: bigint;
  quest: string;
  started: Date;
  browser: Browser;
}

export class AcolyteQuestClient extends Client {
  readonly commands = new Collection<string, Command>();
  public instances = new Collection<bigint, InstanceData>();

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

    this.on("messageCreate", async (message) => {
      if (message.author.bot) return;
      if (!message.content.startsWith(process.env.PREFIX || "]")) return;

      if (
        (await prisma.user.count({
          where: { id: BigInt(message.author.id) },
        })) === 0
      ) {
        await prisma.user.create({ data: { id: BigInt(message.author.id) } });

        for (const [spellId, spell] of spells.entries()) {
          if (spell.unlockLevel === 1) {
            await grantSpell(prisma, BigInt(message.author.id), spellId);
          }
        }
      }
      let command = message.content.split(" ")[0];
      command = command.substring(1);

      try {
        this.commands.get(command)?.execute({ client: this, message });
      } catch (e) {
        message.reply(`Something went wrong. Error: ${e}`);
      }
    });
  }
}

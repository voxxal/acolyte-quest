import { Client, Collection, Intents } from "discord.js";
import { Command } from "../commands";

export class AcolyteQuestClient extends Client {
  readonly commands = new Collection<string, Command>();

  constructor(options: any) {
    super({
      ...options,
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGES,
      ],
    });

    // load default commands


    this.on("message", async message => {
        if (message.author.bot) return;
        if (!message.content.startsWith(process.env.PREFIX || "]")) return;
        if (!(message.channel.type === "DM")) message.reply("Please use Direct Messages to interact with this bot.");
        
    });
  }
}

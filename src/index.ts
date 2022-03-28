import "dotenv/config";
import { Client, Intents } from "discord.js";

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES] });

client.once("ready", () => {
  console.log("Ready!");
});

client.on("message", async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(process.env.PREFIX || "]")) return;
    if (!(message.channel.type === "DM")) message.reply("Please use Direct Messages to interact with this bot.");

}); 


client.login(process.env.TOKEN);

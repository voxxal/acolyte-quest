import "dotenv/config";
import { AcolyteQuestClient } from "./client";
import { deployCommands } from "./deploy";
import prisma from "./prisma";

const client = new AcolyteQuestClient();

client.once("ready", () => {
  console.log("Ready!");
  deployCommands(client);
});

client.login(process.env.TOKEN);
const exit = async () => {
  await prisma.$disconnect();
  (await client.browser()).close();
  client.destroy();
};

process.on("SIGINT", exit);
process.on("SIGTERM", exit);
process.on("SIGUSR2", exit);

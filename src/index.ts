import "dotenv/config";
import { AcolyteQuestClient } from "./client";
import prisma from "./prisma";

const client = new AcolyteQuestClient();

client.once("ready", () => {
  console.log("Ready!");
});

client.login(process.env.TOKEN);
const exit = async () => {
  await prisma.$disconnect();
  for (const [, { browser }] of client.instances) {
    await browser.close();
  }
  client.destroy();
};

process.on("SIGINT", exit);
process.on("SIGTERM", exit);
process.on("SIGUSR2", exit);

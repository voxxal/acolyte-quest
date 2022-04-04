import "dotenv/config";
import { AcolyteQuestClient } from "./client";
import prisma from "./prisma";

const client = new AcolyteQuestClient();

client.once("ready", () => {
  console.log("Ready!");
});

client.login(process.env.TOKEN);
const exit = () => {
  prisma.$disconnect().then(() => client.destroy());
};

process.on("SIGINT", exit);
process.on("SIGTERM", exit);
process.on("SIGUSR2", exit);

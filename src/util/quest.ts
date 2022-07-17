import { APIEmbed, Colors } from "discord.js";

export const failWith = (msg: string): APIEmbed[] => [
  {
    title: "QUEST FAILED",
    color: Colors.Red,
    description: msg,
  },
];

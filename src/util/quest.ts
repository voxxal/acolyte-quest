import { MessageEmbed, MessageEmbedOptions } from "discord.js";

export const failWith = (msg: string): (MessageEmbed | MessageEmbedOptions)[] => [
  {
    title: "QUEST FAILED",
    color: "RED",
    description: msg,
  },
];

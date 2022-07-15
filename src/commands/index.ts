import { ApplicationCommandOptionData, CommandInteraction } from "discord.js";
import { AcolyteQuestClient } from "../client";
import { GrantCommand } from "./grant";
import { ProfileCommand } from "./profile";
import { QuestCommand } from "./quest";

export class CommandContext {
  constructor(public client: AcolyteQuestClient, public interaction: CommandInteraction) {}
}

export interface Command {
  name: string;
  description: string;
  options?: ApplicationCommandOptionData[];
  execute: (context: CommandContext) => Promise<void>;
}

export const commands = [
  new ProfileCommand(),
  new GrantCommand(),
  new QuestCommand(),
];

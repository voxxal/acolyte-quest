import { Message } from "discord.js";
import { AcolyteQuestClient } from "../client";
import { GenerateCommand } from "./generate";
import { HelpCommand } from "./help";
import { ProfileCommand } from "./profile";

export class CommandContext {
  constructor(
    public client: AcolyteQuestClient,
    public message: Message,
  ) {}
}

export interface Command {
  name: string;
  description: string;
  execute: (message: CommandContext) => Promise<void>;
}

export const commands = [new HelpCommand(), new ProfileCommand(), new GenerateCommand()];

import { PrismaClient } from "@prisma/client";
import { Message } from "discord.js";
import { AcolyteQuestClient } from "../client/client";

export class CommandContext {
  constructor(
    public client: AcolyteQuestClient,
    public message: Message,
    public prismaClient: PrismaClient
  ) {}
}

export interface Command {
  name: string;
  description: string;
  execute: (message: CommandContext) => Promise<void>;
}

export const commands = [];

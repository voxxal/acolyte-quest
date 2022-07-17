import {
  ApplicationCommandData,
  ApplicationCommandManager,
  ApplicationCommandDataResolvable,
} from "discord.js";
import { ApplicationCommandType } from "discord.js";
import { AcolyteQuestClient } from "./client";

export const deployCommands = async (
  client: AcolyteQuestClient
): Promise<void> => {
  let commandManager: ApplicationCommandManager | undefined =
    client.application?.commands;
  let commands: ApplicationCommandDataResolvable[] = Array.from(
    client.commands.values(),
    (command) => ({
      type: ApplicationCommandType.ChatInput,
      name: command.name,
      description: command.description,
      options: command.options ?? [],
    })
  );
  commands.sort((a, b) =>
    (a as ApplicationCommandData).name.localeCompare(
      (b as ApplicationCommandData).name
    )
  );

  //   let existing = Array.from(
  //     (await commandManager.fetch({})).values(),
  //     (command) => ({
  //       type: command.type,
  //       name: command.name,
  //       description: command.description,
  //       options: command.options,
  //     })
  //   );

  //   existing.sort((a, b) => a.name.localeCompare(b.name));
  await commandManager.set(commands);
};

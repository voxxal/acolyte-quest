import { ApplicationCommandOptionData } from "discord.js";
import { Command, CommandContext } from ".";
import prisma from "../prisma";
import { spells } from "../spells";
import { grantPlayerExp, grantSpellExp } from "../util/level";
import { grantSpell } from "../util/spells";

export class GrantCommand implements Command {
  // TODO this needs serious refactoring with subcommands which i don't understand yet
  readonly name = "grant";
  readonly description = "Grants you stats (admin only i hope)";
  readonly options: ApplicationCommandOptionData[] = [
    {
      type: "USER",
      name: "user",
      description: "Which user's profile",
      required: true,
    },
    {
      type: "STRING",
      name: "resource",
      description: "What resource to grant",
      choices: [
        {
          name: "Spell",
          value: "spell",
        },
        {
          name: "Player Experience",
          value: "playerExp",
        },
        {
          name: "Spell Experiernce",
          value: "spellExp"
        }
      ],
      required: true,
    },
    {
      type: "STRING",
      name: "amount",
      description: "How much of the resource",
      required: true,
    }
  ];

  async execute({ client, interaction }: CommandContext) {
    const options = interaction.options;
    if (interaction.user.id !== "290952090560364545") {
      await interaction.reply("This is an admin only command.");
      return;
    }
    let playerId = BigInt(options.get("user").user.id);

    const player = await prisma.user.findUnique({
      where: { id: playerId },
    });

    if (player === null) {
      await interaction.reply("Player doesn't exist");
      return;
    }
    const amount = options.get("amount").value as string;
    switch (options.get("resource").value) {
      case "spell":
        {
          await grantSpell(prisma, playerId, amount);
          await interaction.reply(
            `Granted <@!${playerId}> spell ${spells.get(amount).name}`
          );
        }
        break;
      case "playerExp":
        {
          await grantPlayerExp(prisma, playerId, parseFloat(amount));
          await interaction.reply(`Granted <@!${playerId}> ${amount} player exp`);
        }
        break;
      case "spellExp":
        {
          const [spellId, amount1] = amount.split(" ")
          await grantSpellExp(prisma, playerId, spellId, parseFloat(amount1));
          await interaction.reply(
            `Granted <@!${playerId}>'s ${
              spells.get(spellId).name
            } ${amount1} spell exp`
          );
        }
        break;
    }
  }
}

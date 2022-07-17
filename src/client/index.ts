import { Client, Collection, GatewayIntentBits, InteractionType } from "discord.js";
import * as puppeteer from "puppeteer";
import { Command, commands } from "../commands";
import prisma from "../prisma";
import { spells } from "../spells";
import { grantSpell } from "../util/spells";

export interface InstanceData {
  owner: bigint;
  quest: string;
  started: Date;
  page: puppeteer.Page;
}

export class AcolyteQuestClient extends Client {
  readonly commands = new Collection<string, Command>();
  public instances = new Collection<bigint, InstanceData>();
  #browser: puppeteer.Browser | null = null;

  async browser() {
    if (this.#browser === null) {
      this.#browser = await puppeteer.launch();
    }

    return this.#browser;
  }

  constructor(options?: Object) {
    super({
      ...options,
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessages,
      ],
    });

    // load default commands
    commands.forEach((cmd: Command) => this.commands.set(cmd.name, cmd));

    this.on("interactionCreate", async (interaction) => {
      if (interaction.type != InteractionType.ApplicationCommand) return;

      if (
        (await prisma.user.count({
          where: { id: BigInt(interaction.user.id) },
        })) === 0
      ) {
        await prisma.user.create({ data: { id: BigInt(interaction.user.id) } });

        for (const [spellId, spell] of spells.entries()) {
          if (spell.unlockLevel === 1) {
            await grantSpell(prisma, BigInt(interaction.user.id), spellId);
          }
        }
      }

      try {
        await this.commands.get(interaction.command.name)?.execute({ client: this, interaction });
      } catch (e) {
        interaction.reply(`Something went wrong. Error: ${e}`);
      }
    });
  }
}

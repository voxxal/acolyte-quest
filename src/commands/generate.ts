import { Command, CommandContext } from ".";
import { fireball } from "../../assets/spells/fireball";
import { buildModSettings, modToBuffer } from "../modlyte";

export class GenerateCommand implements Command {
  readonly name = "generate";
  readonly description = "Generates a mod based on your stats";

  async execute({ client, message }: CommandContext) {
    const mod: AcolyteFightMod = {
      Mod: buildModSettings({
        name: "Acolyte Quest",
        author: "voxal",
        description: "QUEST: something or idk",
        // I omit title, it will automatically split it into ["Modlyte", "Example"]
        subtitle: ["Goblin", "Hideout"],
      }),
      Spells: {
        fireball: fireball(1),
      },
      Code: "const act = () => null; return { act };",
    };
    message.channel.send({
      files: [{ attachment: modToBuffer(mod), name: "mod.json" }],
    });
  }
}

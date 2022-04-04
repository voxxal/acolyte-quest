import { Command, CommandContext } from ".";


export class HelpCommand implements Command {
    readonly name = "help";
    readonly description = "Shows this message";


    async execute({ client, message }: CommandContext) {
        let i = 0;
        const embed = {
            title: "HELP",
            fields: client.commands.map((command) => { i++; return { name: command.name, value: command.description, inline: i % 3 > 0  } }), //TODO 2 per line
            timestamp: new Date(),
            footer: {
              text: "Acolyte Quest",
              icon_url: client.user?.displayAvatarURL({ size: 256, dynamic: true }),
            },
          };
      
          message.reply({ embeds: [embed] });
    }
}
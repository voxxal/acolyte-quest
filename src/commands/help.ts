import { Command, CommandContext } from ".";


export class HelpCommand implements Command {
    readonly name = "help";
    readonly description = "Shows this message";


    async execute({ client, message }: CommandContext) {
        // embed magic for now not important
    }
}
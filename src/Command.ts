import { ChatInputCommandInteraction, MessageComponentInteraction, ModalSubmitInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";

export interface Command {
    data:
        | SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder
        | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    run: (
        interaction: ChatInputCommandInteraction
    ) => Promise<void>;
    handleMisc?: (
        interaction: MessageComponentInteraction | ModalSubmitInteraction,
        subid: string
    ) => Promise<void>;
}
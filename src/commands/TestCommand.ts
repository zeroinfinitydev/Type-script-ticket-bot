import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Command } from "../Command";
import { ok_desc } from "../utils";

export const CMD: Command = {
    data: new SlashCommandBuilder()
        .setName("test")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription("Test Command")
        .addStringOption(d=>
            d.setName("example")
            .setDescription("Example string input")
            .setRequired(true)
        ),
    async run(ict: ChatInputCommandInteraction): Promise<any> {
        if(ict.guild == null) return;
        ict.reply({
            content: `Text: ${ict.options.get("example", true)?.value}`,
            components: [
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId("test:testbutton")
                        .setStyle(ButtonStyle.Primary)
                        .setLabel("Test Button")
                )
            ]
        });
    }, async handleMisc(ict, subid): Promise<any> {
        if(!ict.isButton()) return; 
        ok_desc("Test Success!", `subid: ${subid}`, ict);
    }
};
import { randomBytes } from "crypto";
import { ChatInputCommandInteraction, Client, Interaction, MessageComponentInteraction, ModalSubmitInteraction, REST, Routes } from "discord.js";
import * as fs from "fs";
import path from "path";
import { Command } from "./Command";
import { stop_desc } from "./utils";

let rest: REST | undefined = undefined;
const commands:{[id: string]: Command} = {};

export async function init() {
    console.log(`[Command] Beginning command load...`);
    await processDir('/commands');
    console.log(`[Command] Finished command load.`);
}

async function processDir(pre: string) {
    let dir = fs.readdirSync(__dirname+pre);
    for (const file of dir.filter(file => file.endsWith('.js'))) {
        const name = file.split(".")[0];
        const cmd_file = await import(path.join(__dirname, pre, `${name}`));
        const command = cmd_file["CMD"] as Command;
        
        commands[command.data.name] = command;
        console.log(`[Command] Loaded Command "${command.data.name}"`);
        dir = dir.filter(d=>d!=file);
    }

    for (const file of dir) {
        let load_path = path.join(pre, file);
        await processDir(load_path);
    }
}

export async function update(client: Client, commands: Command[]) {
    if(rest == undefined)
        rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN!);
    
    let clientId = client.user?.id;
    if(clientId == null)
        return console.error('[Discord] Failed to reload application (/) commands, is the bot ready?');
    
    try {
        console.log('[Discord] Started reload of application (/) commands.');
        let commandData = commands.map(cmd=> cmd.data.toJSON());

        let guilds = client.guilds.cache.map(guild=> guild.id);
        for(let i in guilds) {
            try {
                await rest.put(
                    Routes.applicationGuildCommands(clientId, guilds[i]),
                    { body: commandData },
                );
            } catch(e){
                console.error("[Discord] Error reloading application (/) commands for a guild:", e);
            }
        }

        console.log('[Discord] Finished reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
}

export function getCommandByName(name: string){
    return commands[name];
}

export function getCommands(){
    return Object.values(commands);
}

export function genErrorId(): string {
    return randomBytes(20).toString('base64').replace(/=|\+|\//g, "").substring(0, 10);
}

export async function onInteraction(ict: Interaction) {
    if (ict instanceof ChatInputCommandInteraction) {
        let command = getCommandByName(ict.commandName);
        if(command == null) return;
        try {
            await command.run(ict);
        } catch(e) {
            let id = genErrorId();
            console.error(
                "[TraceID "+id+"] [Discord] Error occured whilst executing a command interaction:",
                e
            );
            await stop_desc("An internal error occured", "Please contact support if this persists.\nTraceID: "+id, ict);
        }
    } else if(ict instanceof MessageComponentInteraction || ict instanceof ModalSubmitInteraction) {
        if(ict.customId.split(":").length <= 1) return;

        let split = ict.customId.split(":");
        let command = getCommandByName(split[0]);
        split.shift()
        let data = split.join(":");
        if(command == null || !command.handleMisc) return;

        try {
            await command.handleMisc(ict, data);
        } catch(e) {
            let id = genErrorId();
            console.error(
                "[TraceID "+id+"] [Discord] Error occured whilst executing a command subinteraction:",
                e
            ); 

            await stop_desc("An internal error occured", "Please contact support if this persists.\nTraceID: "+id, ict);
        }
    }
}
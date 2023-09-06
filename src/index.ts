import { Client, GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";
import * as SCMgr from "./SlashCommandManager";

let bot: Client;
(async () => {
    dotenv.config(); 

    if (!process.env.BOT_TOKEN) {
        console.warn("[System] Missing Discord bot token.");
        return false;
    }

    console.log("[System] Beginning load...");

    bot = new Client({ intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ] });

    bot.on("ready", async ()=>{
        console.log("[Discord] Gateway Ready");
        // Handle other post gateway tasks here
        console.log("[System] Load Complete.");
        if(process.env.UPDATE_COMMANDS) {
            await SCMgr.update(getBot(), SCMgr.getCommands());
        }
    });

    bot.on("interactionCreate", async (interaction) => 
        await SCMgr.onInteraction(interaction)
    );

    bot.on('error', d=>{
        console.log(d);
    });

    bot.login(process.env.BOT_TOKEN);
    SCMgr.init();

})();

export function getBot() { return bot; }

import { ColorResolvable, CommandInteraction, EmbedBuilder, Interaction } from "discord.js";

export function ok(msg: string, ict: Interaction | CommandInteraction) {
    return ok_desc(msg, null, ict);
}

export function ok_desc(msg: string, desc: string | null, ict: Interaction | CommandInteraction){
    return send_emb(msg, desc, "Green", ict);
}

export function stop(msg: string, ict: Interaction | CommandInteraction) {
    return stop_desc(msg, null, ict);
}

export function stop_desc(msg: string, desc: string | null, ict: Interaction | CommandInteraction){
    return send_emb(msg, desc, "#ED4245", ict);
}

export function send_emb(msg: string, desc: string | null, color: ColorResolvable, ict: Interaction | CommandInteraction) {
    let data = {embeds:[
        new EmbedBuilder()
        .setTitle(msg)
        .setDescription(desc)
        .setColor(color)
        .setFooter({text: ict.client.user?.username, iconURL: ict.client.user?.avatarURL() || undefined })
    ], components:[], ephemeral: true};

    if(ict.isRepliable())
        if(ict.replied || ict.deferred)
            ict.editReply(data);
        else ict.reply(data);
}

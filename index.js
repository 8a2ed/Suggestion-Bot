const discord = require('discord.js');
const client = new discord.Client();
///
const fs = require('fs');
const {
    MessageEmbed
} = require('discord.js')
const prefix = require('./db/config.json').prefix;
client.login(require('./db/config.json').token);
///
let sugg = JSON.parse(fs.readFileSync("./db/channels.json", 'utf8'));
let ch2 = JSON.parse(fs.readFileSync("./db/ch2.json", 'utf8'));
///
client.on('ready', () => {
    console.log(`Ready!`);
    client.user.setActivity(`Suggestion bot`);
});
///
////////////////////////// CONFIG //////////////////////////
client.on('message', message => {
    if (!message.channel || message.channel.type === 'dm') return;
    if (message.content.startsWith(prefix + 'setch')) {
        if (!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send(`You don't have permission.`);
        const ch = message.content.split(' ').slice(1).join(' ');
        if (!ch) return message.channel.send(`Please mention the channel or type channel id.`);
        const check = message.guild.channels.cache.find(e => e.id === ch || e.name === ch) || message.mentions.channels.first();
        if (!check) return message.channel.send(`Please type a vaild id or mention.`);
        sugg[message.guild.id] = {
            channel: check.id,
        };
        fs.writeFile("./db/channels.json", JSON.stringify(sugg), (err) => {
            if (err)
                console.error(err);
        });
        const embed = new MessageEmbed()
            .setColor(`RANDOM`)
            .setAuthor(`Success!`)
            .setDescription(`I have saved ${check} as suggestions channel!`)
            .setTimestamp()

        message.channel.send(embed);
    }
})
////
client.on('message', message => {
    if (!message.channel || message.channel.type === 'dm') return;
    if (message.content.startsWith(prefix + 'setwch' || prefix + 'setWaitChannel')) {
        if (!message.member.hasPermission('MANAGE_GUILD')) return message.channel.send(`You don't have permission.`);
        const ch = message.content.split(' ').slice(1).join(' ');
        if (!ch) return message.channel.send(`Please mention the channel or type channel id.`);
        const check = message.guild.channels.cache.find(e => e.id === ch || e.name === ch) || message.mentions.channels.first();
        if (!check) return message.channel.send(`Please type a vaild id or mention.`);
        ch2[message.guild.id] = {
            channel: check.id,
        };
        fs.writeFile("./db/ch2.json", JSON.stringify(sugg), (err) => {
            if (err)
                console.error(err);
        });
        const embed = new MessageEmbed()
            .setColor(`RANDOM`)
            .setAuthor(`Success!`)
            .setDescription(`I have saved ${check} as suggestions channel waiting to accept!`)
            .setTimestamp()

        message.channel.send(embed);
    }
})
///
////////////////////////// SUGGEST //////////////////////////
client.on('message', message => {
    if (!message.channel || message.channel.type === 'dm') return;
    if (message.content.startsWith(prefix + 'suggest')) { // You can add more aliases like: message.content.startsWith(prefix + 'suggest' || prefix + 'اقتراح')
        const sug = message.content.split(' ').slice(1).join(' ');
        
        const v = sugg[message.guild.id];
        const x = ch2[message.guild.id];
        if(!v || v === undefined) return message.channel.send(`I can't find the suggestions channel.`);
        if(!x || x === undefined) return message.channel.send(`I can't find the waiting channel.`);
        const wch = message.guild.channels.cache.find(e => e.id === ch2[message.guild.id].channel);
        const sch = message.guild.channels.cache.find(e => e.id === sugg[message.guild.id].channel);
        if (sug) {
            if (!wch || wch === undefined) return message.channel.send(`I can't find the waiting channel.`);
            if (!sch || sch === undefined) return message.channel.send(`I can't find the suggestion channel.`);
            const sug_waiting = new MessageEmbed()
                .setColor(`RANDOM`)
                .setTitle("New Suggestion is waiting!")
                .setAuthor(message.author.tag, message.author.displayAvatarURL({
                    dynamic: true,
                    format: 'png'
                }))
                .setThumbnail(message.guild.iconURL({
                    dynamic: true,
                    format: 'png'
                }))
                .setDescription(`\`Suggestion\`: **${sug}**.`)
            wch.send(sug_waiting);
            message.channel.send(`Your suggestion was sent and waiting to accept.`);
        } else {
            return message.channel.send(`Type your suggestion.`)
        }
    }
});
///
////////////////////////// ACCEPT & DENY //////////////////////////
client.on('message', async message => {
    if (!message.channel || message.channel.type === 'dm') return;
    if (message.content.startsWith(prefix + 'accept')) {
        if (!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send(`You don't have permission.`);
        const msgID = message.content.split(' ').slice(1).join(' ');
        if (!msgID) return message.channel.send(`Enter the ID of a suggestion message`);
        const v = sugg[message.guild.id];
        const x = ch2[message.guild.id];
        if(!v || v === undefined) return message.channel.send(`I can't find the suggestions channel.`);
        if(!x || x === undefined) return message.channel.send(`I can't find the waiting channel.`);
        const sch = message.guild.channels.cache.find(e => e.id === sugg[message.guild.id].channel);
        const wch = message.guild.channels.cache.find(e => e.id === ch2[message.guild.id].channel);
        if (!wch) return message.channel.send(`I can't find the waiting channel.`);
        if (!sch) return message.channel.send(`I can't find the suggestions channel.`);
        try {
        const suggestedEmbed = await wch.messages.fetch(msgID);
        if (!suggestedEmbed) return message.channel.send("Please enter a valid ID.");
        const data = suggestedEmbed.embeds[0];
        /*
        .setColor(`RANDOM`)
            .setTitle("New Suggestion !")
            .setAuthor(message.author.tag, message.author.displayAvatarURL({
                dynamic: true,
                format: 'png'
            }))
            .setThumbnail(message.guild.iconURL({
                dynamic: true,
                format: 'png'
            }))
            .setDescription(`\`Suggestion\`: **${sug}**.`)
        */
        const acc_sug = new MessageEmbed()
            .setColor(`RANDOM`)
            .setAuthor(data.author.name)
            .setTitle(`Suggestion Accepted !`)
            .setThumbnail(data.thumbnail)
            .setDescription(data.description)
            .addField("Accept by", message.author)
        message.channel.send(`Suggestion approved successfully.`);
        sch.send(acc_sug)
        const user = client.users.cache.find((u) => u.tag === data.author.name);
        user.send(`Your suggestion has been accepted by: **\`${message.author.tag}\`**!`).catch(error => message.channel.send("The author of the suggestion has closed DM's, so I cannot tell you that your suggestion was accepted."));
        } catch (err) { message.channel.send(`Not a suggestion`)}
    }
});
///
client.on('message', async message => {
    if (!message.channel || message.channel.type === 'dm') return;
    if (message.content.startsWith(prefix + 'deny')) {
        if (!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send(`You don't have permission.`);
        const msgID = message.content.split(' ').slice(1).join(' ');
        if (!msgID) return message.channel.send(`Enter the ID of a suggestion message`);
        const v = sugg[message.guild.id];
        const x = ch2[message.guild.id];
        if(!v || v === undefined) return message.channel.send(`I can't find the suggestions channel.`);
        if(!x || x === undefined) return message.channel.send(`I can't find the waiting channel.`);
        const sch = message.guild.channels.cache.find(e => e.id === sugg[message.guild.id].channel);
        const wch = message.guild.channels.cache.find(e => e.id === ch2[message.guild.id].channel);
        if (!wch) return message.channel.send(`I can't find the waiting channel.`);
        if (!sch) return message.channel.send(`I can't find the suggestions channel.`);
        try {
        const suggestedEmbed = await wch.messages.fetch(msgID);
        if (!suggestedEmbed) return message.channel.send("Please enter a valid ID.");
        const data = suggestedEmbed.embeds[0];
        /*
        .setColor(`RANDOM`)
            .setTitle("New Suggestion !")
            .setAuthor(message.author.tag, message.author.displayAvatarURL({
                dynamic: true,
                format: 'png'
            }))
            .setThumbnail(message.guild.iconURL({
                dynamic: true,
                format: 'png'
            }))
            .setDescription(`\`Suggestion\`: **${sug}**.`)
        */
        const acc_sug = new MessageEmbed()
            .setColor(`RANDOM`)
            .setAuthor(data.author.name)
            .setTitle(`Suggestion Denied !`)
            .setThumbnail(data.thumbnail)
            .setDescription(data.description)
            .addField("Denied by", message.author)
        message.channel.send(`Suggestion denied successfully.`);
        sch.send(acc_sug)
        const user = client.users.cache.find((u) => u.tag === data.author.name);
        user.send(`Your suggestion has been denied by: **\`${message.author.tag}\`**!`).catch(error => message.channel.send("The author of the suggestion has closed DM's, so I cannot tell you that your suggestion was accepted."));
        } catch (err) { message.channel.send(`Not a suggestion`)}
    }
});
///
client.on('message', message => {
    if(!message.channel || message.channel.type === 'dm') return;
    if((message.content.startsWith(prefix + 'help'))) {
        const embed = new MessageEmbed()
        .setColor(`RANDOM`)
        .setTitle(`Commands:`)
        .setDescription(`**${prefix}suggest**\n\`To suggest something.\`\n\n**${prefix}accept**\n\`Accept a server suggestion.\`\n\n**${prefix}deny**\n\`Deny a server suggestion.\``)
        message.channel.send(embed)
    }
})
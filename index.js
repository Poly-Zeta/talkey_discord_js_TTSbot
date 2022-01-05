const { joinVoiceChannel, entersState, VoiceConnectionStatus, createAudioResource, StreamType, createAudioPlayer, AudioPlayerStatus, NoSubscriberBehavior, generateDependencyReport, getVoiceConnection } = require("@discordjs/voice");
console.log(generateDependencyReport());
const Discord = require("discord.js");
const twemojiRegex = require('twemoji-parser/dist/lib/regex').default;
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const client = new Discord.Client({
    intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_WEBHOOKS", "GUILD_VOICE_STATES"],
});
const { execSync } = require('child_process');

var fs = require('fs');
var path = require('path');

var tokens = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, "../tokens.json")
    )
);

//どのコマンドをどの鯖に登録するかのデータ取得
var registerSet = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, "../commands.json")
    )
);

//https://www.gesource.jp/weblog/?p=8228
// const { execSync, spawn } = require('child_process');

const commands = {}
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands[command.data.name] = command
}

async function onInteraction(interaction) {
    console.log(interaction.isCommand);
    if (!interaction.isCommand()) {
        return;
    }
    console.log(interaction.commandName);
    return commands[interaction.commandName].execute(interaction);
}

async function onVoiceStateUpdate(oldState, newState) {
    //メンバーがvcから抜けた際，vc残り人数が1で自分自身だったら自身もvcから抜ける
    const botConnection = getVoiceConnection(oldState.guild.id);
    const guild = await client.guilds.fetch(oldState.guild.id);
    const vc = await guild.channels.fetch(oldState.channelId);
    const updatedMember = oldState.member.id;
    if (vc.members != null) {
        if (updatedMember != tokens.myID) {
            // console.log(vc.members.size);
            // console.log(vc.members.filter(member => !member.user.bot).size);
            // console.log("vcupdate");

            //botConnectionがnullなら特に処理する必要はない
            if (vc.members.size >= 1 && vc.members.filter(member => !member.user.bot).size == 0) {
                console.log("auto-disconnect");
                botConnection.destroy();
                const replyMessage = "退出します．";
                return oldState.guild.systemChannel.send(replyMessage);
            }
            return;
        } else {
            console.log("updated my status");
        }
    } else {
        console.log("JOIN");
        return;
    }
}

async function onGuildCreate(guild) {
    console.log(`Create ${guild.name} ${guild.id}`);
    const serverIndex = registerSet.findIndex((v) => v.id === guild.id);
    //何かの事故で鯖IDに重複が無ければ基本となるコマンド群を登録する
    if (serverIndex == -1) {
        registerSet[registerSet.length] = {
            "name": guild.name,
            "id": guild.id,
            "registerCommands": []
        };
        fs.writeFileSync(
            path.resolve(__dirname, "../commands.json"),
            JSON.stringify(registerSet, undefined, 4),
            "utf-8"
        );
        console.log("create default commands");
        if (process.platform == "linux") {
            const stdout = execSync('node register.js');
            console.log("created");
        }
    }
    return guild.systemChannel.send("新規利用ありがとうございます．基本的なコマンドを本サーバに追加しました．拡張コマンドについては/addを使用して確認してください．");
}

async function onGuildDelete(guild) {
    console.log(`Delete ${guild.name} ${guild.id}`);
    const serverIndex = registerSet.findIndex((v) => v.id === guild.id);
    if (serverIndex != -1) {
        registerSet.splice(serverIndex, 1);
        fs.writeFileSync(
            path.resolve(__dirname, "../commands.json"),
            JSON.stringify(registerSet, undefined, 4),
            "utf-8"
        );
        console.log("delete default commands");
        if (process.platform == "linux") {
            const stdout = execSync('node register.js');
            console.log("deleted");
        }
    }
    return;
}

//ここのコードの改造
//https://github.com/Nich87/Discord-Musicbot/blob/v13-remaster/main.js
client.on('ready', () => {
    console.log('stand by');
    if (process.platform == "linux") {
        const stdout = execSync('node register.js');
    }
    console.table({
        'Bot User:': client.user.tag,
        'Guild(s):': client.guilds.cache.size + 'Servers',
        'Watching:': client.guilds.cache.reduce((a, b) => a + b.memberCount, 0) + 'Members',
        // 'Prefix:': config.prefix,
        'Discord.js:': 'v' + require('discord.js').version,
        'Node.js:': process.version,
        'Plattform:': process.platform + '|' + process.arch
    });
});

client.on("interactionCreate", interaction => onInteraction(interaction).catch(err => console.error(err)));
client.on("voiceStateUpdate", (oldState, newState) => onVoiceStateUpdate(oldState, newState).catch(err => console.error(err)));
client.on('guildCreate', guild => onGuildCreate(guild).catch(err => console.error(err)));
client.on('guildDelete', guild => onGuildDelete(guild).catch(err => console.error(err)));

client.login(tokens.bot).catch(err => {
    console.error(err);
    process.exit(-1);
});
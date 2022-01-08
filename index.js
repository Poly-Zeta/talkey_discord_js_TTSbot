// const { joinVoiceChannel, entersState, VoiceConnectionStatus, createAudioResource, StreamType, createAudioPlayer, AudioPlayerStatus, NoSubscriberBehavior, generateDependencyReport, getVoiceConnection } = require("@discordjs/voice");
const { generateDependencyReport, getVoiceConnection, getVoiceConnections } = require("@discordjs/voice");
console.log(generateDependencyReport());
const Discord = require("discord.js");
const { MessageEmbed } = require('discord.js');
const { deleteGuildToMap } = require('./functions/audioMap.js');

const client = new Discord.Client({
    intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_WEBHOOKS", "GUILD_VOICE_STATES"],
});
const { execSync } = require('child_process');

var fs = require('fs');
var path = require('path');

//************************************************************************************ */
//json読み込み系
//トークンとかIDとか
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

//************************************************************************************ */

//コマンド用ファイルの読み込み->コマンドをリストにする
const commands = {}
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands[command.data.name] = command
}

//************************************************************************************ */
//interactionイベント時
async function onInteraction(interaction) {
    console.log(interaction.isCommand);
    if (!interaction.isCommand()) {
        return;
    }
    console.log(interaction.commandName);
    return commands[interaction.commandName].execute(interaction);
}

//************************************************************************************ */
//vcのステータスアップデート時
async function onVoiceStateUpdate(oldState, newState) {
    console.log(oldState.channelId, newState.channelId);
    // console.log(getVoiceConnections().size);

    client.user.setActivity(statusMessageGen(getVoiceConnections().size, client.guilds.cache.size), { type: 'LISTENING' });

    const botConnection = getVoiceConnection(oldState.guild.id);
    const guild = await client.guilds.fetch(oldState.guild.id);
    const vc = await guild.channels.fetch(oldState.channelId);
    if (vc.members != null) {
        //メンバーがvcから抜けた際，vc残り人数が1で自分自身だったら自身もvcから抜ける
        if (vc.members.size >= 1 && vc.members.filter(member => !member.user.bot).size == 0) {
            console.log("auto-disconnect");
            botConnection.destroy();
            deleteGuildToMap(guild.id);
            const replyMessage = "自動退出します．";
            return oldState.guild.systemChannel.send(replyMessage);
        }
        return;
    } else {
        console.log("JOIN");
        return;
    }
}

function statusMessageGen(vcCount, guildSize) {
    return `${vcCount}/${guildSize}ギルドで読み上げ`;
}

//************************************************************************************ */

//新規にサーバに参加した際の処理
async function onGuildCreate(guild) {
    console.log(`Create ${guild.name} ${guild.id}`);
    const serverIndex = registerSet.findIndex((v) => v.id === guild.id);

    //何かの事故で鯖IDに重複が無ければ，基本となるコマンド群を登録する
    if (serverIndex == -1) {

        //基本形1ブロックを追加して
        registerSet[registerSet.length] = {
            "name": guild.name,
            "id": guild.id,
            "registerCommands": []
        };

        //ファイルに書き込み
        fs.writeFileSync(
            path.resolve(__dirname, "../commands.json"),
            JSON.stringify(registerSet, undefined, 4),
            "utf-8"
        );
        console.log("create default commands");

        //開発機がwinで実機がラズパイのため悲しみのif文
        if (process.platform == "linux") {
            const stdout = execSync('node register.js');
            console.log("created");
        }
    }
    const embed = new MessageEmbed()
        .setTitle('新規利用ありがとうございます．')
        .setColor('#0000ff')
        .addFields(
            {
                name: "通知",
                value: "基本的なコマンドを本サーバに追加しました．拡張コマンドについては/addを使用して確認してください．"
            },
            {
                name: "基本的なコマンド類",
                value: "join,talk,bye等 テキストチャット欄に「/」を打ち込むと確認できます．"
            },
            {
                name: "拡張コマンド",
                value: "サーバの管理者のみ，/addを使用することでコマンドを一部追加できます．"
            },
        );

    return guild.systemChannel.send({ embeds: [embed] });
    // return guild.systemChannel.send("新規利用ありがとうございます．基本的なコマンドを本サーバに追加しました．拡張コマンドについては/addを使用して確認してください．");
}

//************************************************************************************ */

//サーバから退出したり，サーバが爆散したりしたときの処理
async function onGuildDelete(guild) {
    console.log(`Delete ${guild.name} ${guild.id}`);
    const serverIndex = registerSet.findIndex((v) => v.id === guild.id);

    //一応json内を検索はする．基本あるはず...
    if (serverIndex != -1) {

        //消す
        registerSet.splice(serverIndex, 1);

        //書き込み
        fs.writeFileSync(
            path.resolve(__dirname, "../commands.json"),
            JSON.stringify(registerSet, undefined, 4),
            "utf-8"
        );
        console.log("delete default commands");

        //悲しみのif
        if (process.platform == "linux") {
            const stdout = execSync('node register.js');
            console.log("deleted");
        }
    }
    return;
}

//************************************************************************************ */

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
        'Discord.js:': 'v' + require('discord.js').version,
        'Node.js:': process.version,
        'Plattform:': process.platform + '|' + process.arch
    });
    client.user.setActivity(statusMessageGen(getVoiceConnections().size, client.guilds.cache.size), { type: 'LISTENING' });
    client.channels.cache.get(tokens.bootNotifyChannel).send('起動しました．');
    setInterval(() => {
        const reportChannel = client.channels.cache.get(tokens.reportingChannel);
        const now = Date.now();
        const vcMessage = statusMessageGen(getVoiceConnections().size, client.guilds.cache.size);
        const tempStdout = execSync('vcgencmd measure_temp');
        const memStdout = execSync('free');
        reportChannel.send(`${now}\n${vcMessage}\n${tempStdout}\n${memStdout}`);

    }, 1000 * 60 * 60);
});

client.on("interactionCreate", interaction => onInteraction(interaction).catch(err => console.error(err)));
client.on("voiceStateUpdate", (oldState, newState) => onVoiceStateUpdate(oldState, newState).catch(err => console.error(err)));
client.on('guildCreate', guild => onGuildCreate(guild).catch(err => console.error(err)));
client.on('guildDelete', guild => onGuildDelete(guild).catch(err => console.error(err)));

client.login(tokens.bot).catch(err => {
    console.error(err);
    process.exit(-1);
});
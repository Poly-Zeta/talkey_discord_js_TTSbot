const { generateDependencyReport, getVoiceConnection, getVoiceConnections, VoiceConnection } = require("@discordjs/voice");
console.log(generateDependencyReport());
const Discord = require("discord.js");
const { MessageEmbed } = require('discord.js');
const { getGuildMap, addAudioToMapQueue, moveVoiceChannel, deleteGuildToMap } = require('./functions/audioMap.js');
const { talkFunc } = require('./functions/talkFunc.js');

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
    // console.log(interaction);
    if (!interaction.isCommand()) {
        return;
    }
    console.log(interaction.commandName);
    return commands[interaction.commandName].execute(interaction);
}

//************************************************************************************ */
//vcのステータスアップデート時
async function onVoiceStateUpdate(oldState, newState) {
    // console.log(oldState.channelId, newState.channelId, (oldState.member.id == tokens.myID), (newState.member.id == tokens.myID));
    client.user.setActivity(statusMessageGen(getVoiceConnections().size, client.guilds.cache.size), { type: 'LISTENING' });

    const updateMember = oldState.member;
    const oldGuild = oldState.guild;
    const newGuild = newState.guild;
    const oldVc = oldState.channel;
    const newVc = newState.channel;
    const oldVcId = oldState.channelId;
    const newVcId = newState.channelId;
    const oldBotConnection = getVoiceConnection(oldGuild.id);
    const newBotConnection = getVoiceConnection(newGuild.id);
    const oldGuildBotVcData = await getGuildMap(oldGuild.id);
    const newGuildBotVcData = await getGuildMap(newGuild.id);

    // const guild = await client.guilds.fetch(oldState.guild.id);
    // const oldvc = await guild.channels.fetch(oldState.channelId);
    // //new側に人がいるかを確認する用
    // const newvc = await guild.channels.fetch(newState.channelId);

    //old:null,new:null->イベントにならない
    //old:null,new:xxxx->vcに参加っぽい
    //old:xxxx,new:null->vcから離脱っぽい
    //old:xxxx,new:xxxx->ミュートのオンオフや移動

    //誰かのミュートを検出->特にアクションはない
    if (oldVcId === newVcId && oldVc !== null) {
        if (updateMember.id === tokens.myID) {
            console.log("i mute or unmute");
        } else {
            console.log("user mute or unmute");
        }
        return;
    }

    //誰かの移動を検出
    //誰かがbotのいるvcから出て行った->ボイス
    //誰かがbotのいるvcに入って来た->ボイス
    //botの移動(botが入退室を同時に行った場合それはユーザの操作であり，サーバ間をまたぐことは無いはず)
    //->botの移動先は空？
    //Y:(botの移動先が空)->自動退室
    //N:bot移動を関数に投げる

    //移動か？
    if (oldVcId !== newVcId && oldVc !== null && newVc !== null) {
        console.log("move");
        //移動はbotのものか？
        if (updateMember.id === tokens.myID) {
            //botの移動は，ひとつのサーバでしか行われないはず
            console.log("i move");
            //移動先は空か？
            if (newState.member.size >= 1 && newState.members.filter(member => !member.user.bot).size == 0) {
                //空なので自動退室
                console.log("auto-disconnect");
                newBotConnection.destroy();
                deleteGuildToMap(newGuild.id);
                const replyMessage = "ボイスチャットが空のため，退出します．";
                return newGuild.systemChannel.send(replyMessage);
            } else {
                console.log("move execute");
                //同じギルド内で，空でないvcに移動した．前のギルドからデータを移行
                newGuild.systemChannel.send("botの移動を検知しました．接続データを変更します．\nまた，お手数ですがbotの移動は/bye->/joinで行ってください．");
                return await moveVoiceChannel(newGuild, newGuild.id, oldVc, newVc);
            }
        } else {
            //ユーザの移動
            console.log("user move");
            //この移動はひとつのサーバで行われたか？
            if (newGuild.id === oldGuild.id) {
                //ユーザがひとつのサーバ内でvcを移動した．botはどちらか1箇所に居る/居ない
                //botは居る？
                if (oldBotConnection != undefined) {

                }
            } else {
                //移動前のサーバにbotは居たか？
                if (oldBotConnection != undefined) {
                    console.log("oldvc now");
                    //移動前のvcは空か？
                    if (oldState.member.size >= 1 && oldState.members.filter(member => !member.user.bot).size == 0) {
                        //空なので自動退室
                        console.log("auto-disconnect");
                        oldBotConnection.destroy();
                        deleteGuildToMap(oldGuild.id);
                        const replyMessage = "ボイスチャットが空のため，退出します．";
                        oldGuild.systemChannel.send(replyMessage);
                    } else {
                        //空でないのでユーザの退出
                        console.log("user disconnect");
                        //ユーザの退室したvcはbotの居るものと同じか？
                        if (oldVcId == oldGuildBotVcData.voiceChannelId) {
                            addAudioToMapQueue(oldGuild.id, `${updateMember.displayName}さんが通話から退出しました`, "f1");
                        }
                    }
                }
                //移動先のサーバにbotは居るか？
                if (newBotConnection != undefined && newVcId == newGuildBotVcData.voiceChannelId) {
                    console.log("user connect");
                    addAudioToMapQueue(newGuild.id, `${updateMember.displayName}さんが通話に参加しました`, "f1");
                }
                return;
            }
        }
    }

    //誰かの参加を検出
    if (oldVc === null && newVc !== null) {
        if (updateMember.id === tokens.myID) {
            console.log("i join");
            if (newState.member.size >= 1 && newState.members.filter(member => !member.user.bot).size == 0) {
                //空なので自動退室
                console.log("auto-disconnect");
                newBotConnection.destroy();
                deleteGuildToMap(newGuild.id);
                const replyMessage = "ボイスチャットが空のため，退出します．";
                newGuild.systemChannel.send(replyMessage);
            }
        } else {
            console.log("user join");
            if (newBotConnection != undefined && newVcId == newGuildBotVcData.voiceChannelId) {
                addAudioToMapQueue(newGuild.id, `${updateMember.displayName}さんが通話に参加しました`, "f1");
            }
        }
        return;
    }

    //誰かの退出を検出
    if (oldVc !== null && newVc === null) {
        if (updateMember.id === tokens.myID) {
            console.log("i disconnect");
        } else {
            console.log("user disconnect");
            //退出前vcにbotは居るか？
            if (oldBotConnection != undefined) {
                //退出前のvcは空か？
                if (oldState.member.size >= 1 && oldState.members.filter(member => !member.user.bot).size == 0) {
                    //空なので自動退室
                    console.log("auto-disconnect");
                    oldBotConnection.destroy();
                    deleteGuildToMap(oldGuild.id);
                    const replyMessage = "ボイスチャットが空のため，退出します．";
                    return oldGuild.systemChannel.send(replyMessage);
                } else {
                    //空でない
                    //ユーザが退出したチャンネルにbotがいるか？
                    if (oldVcId == oldGuildBotVcData.voiceChannelId) {
                        //残っている人に退室メッセージ
                        return addAudioToMapQueue(oldGuild.id, `${updateMember.displayName}さんが通話から退出しました`, "f1");
                    }
                }
            }
        }
        return;
    }

    // //自身に関係無い場合
    // if (memberId != tokens.myID) {
    //     console.log("user event");
    //     if (newState.channelId === oldState.channelId) {
    //         console.log("mute or unmute");
    //         return;
    //     }
    //     //ユーザのイベントについては，vcが空になった場合のみ反応したい
    //     //->botは留まっている(はず)なので，oldStateの情報から判断できる

    //     // const botConnection = getVoiceConnection(oldState.guild.id);

    //     //oldのvcにまだ
    //     if (!oldvc.members) {
    //         console.log("join");
    //         return;
    //     }
    //     //vc残り人数が1以上で，残っている人数からbotを省いたら0人だったら自身もvcから抜ける
    //     if (oldvc.members.size >= 1 && oldvc.members.filter(member => !member.user.bot).size == 0) {
    //         console.log("auto-disconnect");
    //         botConnection.destroy();
    //         deleteGuildToMap(guild.id);
    //         const replyMessage = "ボイスチャットが空になりました．自動退出します．";
    //         return oldState.guild.systemChannel.send(replyMessage);
    //     }
    //     return;
    // }

    // //自身のステータスに変更があり，oldだけがnull->joinコマンド
    // if (oldState.channelId === null) {
    //     console.log("i connect");
    //     return;
    // }

    // //自身のステータスに変更があり，oldがnullでないブロック
    // //newがnull->何かしらの手段で退出
    // if (newState.channelId === null) {
    //     console.log("i disconnect");

    //     //queueMapに残っていたら消す
    //     console.log(await getGuildMap(guild.id));
    //     if (await getGuildMap(guild.id) !== undefined) {
    //         deleteGuildToMap(guild.id);
    //         // const botConnection = getVoiceConnection(oldState.guild.id);
    //         botConnection.destroy();
    //     }
    //     return;
    // }

    // //ここまで来ている場合，移動やミュートをされているはず

    // //ミュート/解除
    // if (newState.channelId === oldState.channelId) {
    //     console.log("mute or unmute");
    //     return;
    // }


    // //移動先が空の場合->自動退室
    // if (newvc.members.size >= 1 && newvc.members.filter(member => !member.user.bot).size == 0) {
    //     const botConnection = getVoiceConnection(newState.guild.id);
    //     console.log("auto-disconnect");
    //     botConnection.destroy();
    //     deleteGuildToMap(guild.id);
    //     const replyMessage = "空のボイスチャットへの移動を検知しました．自動退出します．";
    //     return oldState.guild.systemChannel.send(replyMessage);
    // }

    // //移動先に人がいる場合->音声再生マップを書き換え
    // guild.systemChannel.send("botの移動を検知しました．接続データを変更します．\nまた，お手数ですがbotの移動は/bye->/joinで行ってください．");
    // return await moveVoiceChannel(guild, guild.id, oldState.channel, newState.channel);
}

function statusMessageGen(vcCount, guildSize) {
    return `${vcCount}/${guildSize}ギルドで読み上げ`;
}

//************************************************************************************ */

//新規にサーバに参加した際の処理
async function onGuildCreate(guild) {
    console.log(`Create ${guild.name} ${guild.id}`);
    client.user.setActivity(statusMessageGen(getVoiceConnections().size, client.guilds.cache.size), { type: 'LISTENING' });
    client.channels.cache.get(tokens.newGuildNotifyChannel).send('新規にサーバに参加しました．');
    // const serverIndex = registerSet.findIndex((v) => v.id === guild.id);

    //基本形1ブロックを追加して
    registerSet[guild.id] = {
        "name": guild.name,
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
}

//************************************************************************************ */

//サーバから退出したり，サーバが爆散したりしたときの処理
async function onGuildDelete(guild) {
    console.log(`Delete ${guild.name} ${guild.id}`);
    client.user.setActivity(statusMessageGen(getVoiceConnections().size, client.guilds.cache.size), { type: 'LISTENING' });
    client.channels.cache.get(tokens.newGuildNotifyChannel).send('サーバから退出しました．');

    //消す
    delete registerSet[guild.id];

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
        if (process.platform == "linux") {
            const tempStdout = execSync('vcgencmd measure_temp');
            const memStdout = execSync('free');
            reportChannel.send(`${now}\n${vcMessage}\n${tempStdout}\n${memStdout}`);
        }
    }, 1000 * 60 * 60);
});

async function onMessage(message) {
    //  /ttsList join 等で，読み上げ対象鯖のリストにユーザidを登録する
    //そのうえでmessageが送られた時，
    //1.message.guildIdが読み上げ対象鯖のリストに存在する
    //2.鯖データの読み上げ対象者リストが空でない
    //3.message.author.idがその中のデータにある
    //4.messageのInteractionがnullである
    //5.botがvcに参加している
    //の1~4がそろえば読み上げる
    // console.log(message.content);

    //1
    const guildData = await getGuildMap(message.guildId);
    if (!guildData) {
        // console.log("autotts guild==null");
        return;
    }

    //2
    const memberIdMap = guildData.memberId;
    if (memberIdMap.size == 0) {
        // console.log("autotts memberIdList==0");
        return;
    }

    //3
    // console.log(memberIdMap.get(message.author.id));
    if (!memberIdMap.has(message.author.id)) {
        // console.log("autotts user is not include");
        return;
    }

    //4
    if (message.interaction != null) {
        // console.log("autotts interaction!=null");
        return;
    }

    //5
    const botConnection = getVoiceConnection(message.guildId);
    if (botConnection == undefined) {
        return;
    }

    await talkFunc(message);
    return;
}

client.on("interactionCreate", interaction => onInteraction(interaction).catch(err => console.error(err)));
client.on("voiceStateUpdate", (oldState, newState) => onVoiceStateUpdate(oldState, newState).catch(err => console.error(err)));
client.on('guildCreate', guild => onGuildCreate(guild).catch(err => console.error(err)));
client.on('guildDelete', guild => onGuildDelete(guild).catch(err => console.error(err)));
client.on('messageCreate', message => onMessage(message).catch(err => console.error(err)));

client.login(tokens.bot).catch(err => {
    console.error(err);
    process.exit(-1);
});

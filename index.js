const { generateDependencyReport, getVoiceConnection, getVoiceConnections } = require("@discordjs/voice");
console.log(generateDependencyReport());
const Discord = require("discord.js");
// const { EmbedBuilder } = require('discord.js');
const {
    Client,
    EmbedBuilder ,
    ActivityType,
    ClientApplication,
    GatewayIntentBits: {
        Guilds,
        GuildMessages,
        MessageContent,
        // GuildMembers,
        GuildWebhooks,
        GuildVoiceStates
    }
} = require("discord.js");
const { getGuildMap, addAudioToMapQueue, moveVoiceChannel, deleteGuildToMap, scanQueueMap } = require('./functions/audioMap.js');
const { talkFunc } = require('./functions/talkFunc.js');
const { addAutoSpeechCounter, output } = require('./functions/talkLog.js');
const { addGuildData, deleteGuildData } = require('./functions/commandDBIO.js');
const cron = require('node-cron')
const { execSync } = require('child_process');

const client = new Discord.Client({
    intents: [
        Guilds,
        GuildMessages,
        MessageContent,
        // GuildMembers,
        GuildWebhooks,
        GuildVoiceStates
    ],
});

var fs = require('fs');
var path = require('path');
const { exit } = require("process");
// const { channel } = require("diagnostics_channel");

async function errorViewer(eventName,error){
    console.error(error);
    client.channels.cache.get(tokens.errorNotifyChannel).send(`${eventName} : \n${error}`)
    .then(() => {
        if(error=="AbortError: The operation was aborted"){
            console.log("abort error");
        }else if(error=="DiscordAPIError: Missing Access"){
            console.log("missing access");
        }else if(error=="DiscordAPIError[10062]: Unknown interaction"){
            console.log("unknown interaction");
        }else{
            exit(1);
        }
    })
}

process.on('unhandledRejection', error => {
    console.log(`unhandledRejection:\n${error}`);
    errorViewer('unhandled',error);
});

//************************************************************************************ */
//json読み込み系

var absolutePath = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, "../path.json")
    )
);

//トークンとかIDとか
var tokens = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, absolutePath.tokens)
    )
);
// console.log("s");
// console.log(tokens.errorNotifyChannel);

//自動ロールバック機能の兼ね合いでコミットのhash保存が必要になった
const stdout=execSync("git rev-parse HEAD").toString()
tokens.nowRepository= stdout;
fs.writeFileSync(
    path.resolve(__dirname, absolutePath.tokens),
    JSON.stringify(tokens, undefined, 4),
    "utf-8"
);
// console.log(tokens.errorNotifyChannel);

//どのコマンドをどの鯖に登録するかのデータ取得
// var registerSet = JSON.parse(
//     fs.readFileSync(
//         path.resolve(__dirname, absolutePath.commands)
//     )
// );

var statConfig = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, absolutePath.stat)
    )
);

//************************************************************************************ */

//コマンド用ファイルの読み込み->コマンドをリストにする
const commands = {}
const commandFiles = fs.readdirSync(absolutePath.commandsdir).filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
    const command = require(`${absolutePath.commandsdir}/${file}`);
    commands[command.data.name] = command
}

//************************************************************************************ */
//interactionイベント時
async function onInteraction(interaction) {
    // if (!interaction.isCommand()) {
    if (!interaction.isChatInputCommand()) {
        return;
    }
    await interaction.reply('working!');
    // interaction.channel.sendTyping();
    console.log(interaction.guild.name);
    console.log(interaction.commandName);
    return commands[interaction.commandName].execute(interaction);
}

//************************************************************************************ */
//vcのステータスアップデート時
async function onVoiceStateUpdate(oldState, newState) {
    // console.log(oldState.channelId, newState.channelId, (oldState.member.id == tokens.myID), (newState.member.id == tokens.myID));
    client.user.setActivity(statusMessageGen(getVoiceConnections().size, client.guilds.cache.size), { type: ActivityType.Listening});

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

    let oldTextChannelId;
    let newTextChannelId
    try{
        oldTextChannelId=oldGuildBotVcData.textChannelId;
    }catch(e){
        // console.log("入退室メッセージ関連のError,問題はない");
    }
    try{
        newTextChannelId=newGuildBotVcData.textChannelId;
    }catch(e){
        // console.log("入退室メッセージ関連のError,問題はない");
    }


    // console.log(oldState.channelId, newState.channelId, (oldState.member.id == tokens.myID), (newState.member.id == tokens.myID), oldGuild.id, newGuild.id);

    //確実に参加
    if (oldVc === null && newVc !== null) {
        // console.log("join");
        //ユーザの移動？
        if (updateMember.id !== tokens.myID) {
            // console.log("user join");
            //ユーザの参加したギルドにbotは居ない？->居なければ関係ないのでreturn
            // console.log(newBotConnection);
            if (newBotConnection === undefined) { return; }

            //ユーザの参加したギルドにbotは居る，ではユーザの参加したvcにbotは居る？
            if (newGuildBotVcData.voiceChannelId === newVcId) {
                // console.log("im participating in");
                return addAudioToMapQueue(newGuild.id, "システム", `${updateMember.user.username}さんが通話に参加しました`, "f1");
            }
            return;
        } else {
            // console.log("i join");
            return;
        }
    }

    //確実に退出
    if (oldVc !== null && newVc === null) {
        // console.log("disconnect");
        //ユーザの移動？
        if (updateMember.id !== tokens.myID) {
            // console.log("user disconnect");
            //ユーザの退出したギルドにbotは居ない？->居なければ関係ないのでreturn
            if (oldBotConnection === undefined) { return; }

            //ユーザの退出したギルドにbotは居る，ではユーザの退出したvcにbotは居る？
            if (oldGuildBotVcData.voiceChannelId === oldVcId) {
                // console.log("im participating in");
                //そのvcは空になった？
                if (oldVc.members.size >= 1 && oldVc.members.filter(member => !member.user.bot).size == 0) {
                    // console.log("auto-disconnect");
                    try {
                        if(oldVc.userLimit>0){
                            await oldVc.setUserLimit(oldVc.userLimit-1);
                        }
                        deleteGuildToMap(oldGuild.id);
                        oldBotConnection.destroy();
                        await client.channels.cache.get(oldTextChannelId).send("ボイスチャットが空になりました．自動退出します．");
                        return;
                    } catch (error) {
                        await oldGuild.systemChannel.send("ボイスチャットが空になりました．自動退出します．");
                        return;
                    }
                }

                //ユーザが退出したvcにbotが居て，まだ他のユーザが居るので退出メッセージ
                return addAudioToMapQueue(oldGuild.id, "システム", `${updateMember.user.username}さんが通話から退出しました`, "f1");;
            }

            //ユーザの退出したギルドにbotは居るが，同一vcではないので処理しない
            return;
        } else {
            // console.log("i disconnect");
            return;
        }
    }

    //ここまでで，oldかnewのどちらかがnullである状態はありえない
    //かつ，どちらもnewなときはイベントにならない
    //両方がnullでないので
    //guildIdの値が一致->同一ギルド内でのvc移動か(vcIdの不一致)，ミュート(一致)
    //不一致->ギルド間移動

    //同一ギルド内でのアクションについて
    if (oldGuild.id === newGuild.id) {
        // console.log("same guild id");

        if (oldVcId === newVcId) {
            // console.log("same vc,mute or unmute");
            return;
        }
        //ユーザのアクション？
        if (updateMember.id !== tokens.myID) {
            // console.log("user action");
            //ユーザがvcを離れる/入ると動いたので，離脱，退出通知/入室通知が必要
            //botは接続してる？
            if (oldBotConnection !== undefined) {
                // console.log("im participating in");
                //oldのほうにbotが居る？
                if (oldGuildBotVcData.voiceChannelId === oldVcId) {
                    // console.log("old");
                    //oldはその移動で空になった？
                    if (oldVc.members.size >= 1 && oldVc.members.filter(member => !member.user.bot).size == 0) {
                        // console.log("auto-disconnect");
                        if(oldVc.userLimit>0){
                            await oldVc.setUserLimit(oldVc.userLimit-1);
                        }
                        deleteGuildToMap(oldGuild.id);
                        oldBotConnection.destroy();
                        // return oldGuild.systemChannel.send("ボイスチャットが空になりました．自動退出します．");
                        return await client.channels.cache.get(oldTextChannelId).send("ボイスチャットが空になりました．自動退出します．");
                    }
                    //空になってないので退出通知
                    return addAudioToMapQueue(oldGuild.id, "システム", `${updateMember.user.username}さんが通話から退出しました`, "f1");
                }

                if (newGuildBotVcData.voiceChannelId === newVcId) {
                //ユーザの移動先vcにbotが居る状態なので入室通知
                    return addAudioToMapQueue(newGuild.id, "システム", `${updateMember.user.username}さんが通話に参加しました`, "f1");
                }
            }
            return;
        }

        //ここに来た場合はbotの移動かミュート
        //移動？
        if (oldVcId !== newVcId) {
            // console.log("i move");
            //移動先に人がいる場合/空のvcに突っ込まれた場合のどちらかで，接続データの変更/切断をする

            //移動先は空？
            if (newVc.members.size >= 1 && newVc.members.filter(member => !member.user.bot).size == 0) {
                // console.log("auto-disconnect");
                deleteGuildToMap(newGuild.id);
                newBotConnection.destroy();
                // return newGuild.systemChannel.send("空のボイスチャットに移動しました．自動退出します．");
                return await client.channels.cache.get(newTextChannelId).send("空のボイスチャットに移動しました．自動退出します．");
            }

            //再接続処理
            // oldGuild.systemChannel.send("botの移動を検知しました．接続データを変更します．読み上げなくなった際は，/byeと/joinで再接続してみてください．");
            await client.channels.cache.get(oldTextChannelId).send("botの移動を検知しました．接続データを変更します．読み上げなくなった際は，/byeと/joinで再接続してみてください．");
            let isExpand=false;
            if(0<newVc.userLimit && newVc.userLimit<99){
                await newVc.setUserLimit(newVc.userLimit+1);
                isExpand=true;
            }
            if(oldVc.userLimit>0){
                await oldVc.setUserLimit(oldVc.userLimit-1);
            }
            return await moveVoiceChannel(oldGuild, oldGuild.id, oldVc, newVc,isExpand);
        }
        //ここに来たらbotのミュート
        // console.log("i mute or unmute");
        return;
    }

    //ギルドをまたいだアクションについて
    // console.log("different guild id");
    // console.log("user move");
    //ここまで来たら，それぞれのvcにbotがいるか調べて処理
    if (oldBotConnection !== undefined) {
        //oldはその移動で空になった？
        if (oldVc.members.size >= 1 && oldVc.members.filter(member => !member.user.bot).size == 0) {
            // console.log("auto-disconnect");
            if(oldVc.userLimit>0){
                await oldVc.setUserLimit(oldVc.userLimit-1);
            }
            deleteGuildToMap(oldGuild.id);
            oldBotConnection.destroy();
            // return oldGuild.systemChannel.send("ボイスチャットが空になりました．自動退出します．");
            return await client.channels.cache.get(oldTextChannelId).send("ボイスチャットが空になりました．自動退出します．");
        }
        //空になってないので退出通知
        return addAudioToMapQueue(oldGuild.id, "システム", `${updateMember.user.username}さんが通話から退出しました`, "f1");
    }

    if (newBotConnection !== undefined) {
        return addAudioToMapQueue(newGuild.id, "システム", `${updateMember.user.username}さんが通話に参加しました`, "f1");
    }
    return;
}

function statusMessageGen(vcCount, guildSize) {
    return `${guildSize}ギルド中${vcCount}ギルドで読み上げ`;
}

//************************************************************************************ */

//新規にサーバに参加した際の処理
async function onGuildCreate(guild) {
    console.log(`Create ${guild.name} ${guild.id}`);
    client.user.setActivity(statusMessageGen(getVoiceConnections().size, client.guilds.cache.size), {type: ActivityType.Listening});
    client.channels.cache.get(tokens.newGuildNotifyChannel).send('新規にサーバに参加しました．');
    // const serverIndex = registerSet.findIndex((v) => v.id === guild.id);

    await addGuildData(guild.id, guild.name);
    // //基本形1ブロックを追加して
    // registerSet[guild.id] = {
    //     "name": guild.name,
    //     "registerCommands": []
    // };

    // //ファイルに書き込み 非同期
    // fs.writeFile(
    //     path.resolve(__dirname, absolutePath.commands),
    //     JSON.stringify(registerSet, undefined, 4),
    //     "utf-8",
    //     (err) => { if (err) { console.log(err); } }
    // );

    console.log("create default commands");

    guild.commands.set([commands["add"].data]);
    console.log("created");

    const embed = new EmbedBuilder()
        .setTitle('新規利用ありがとうございます．')
        .setColor('#0000ff')
        .addFields(
            {
                name: "通知",
                value: "基本的なコマンドを本サーバに追加しました．拡張コマンドについては/addを使用して確認してください．"
            },
            {
                name: "基本的なコマンド類",
                value: "join,talk,bye等，読み上げに関連するコマンドです．テキストチャット欄に「/」を打ち込むと一覧が表示されます．"
            },
            {
                name: "拡張コマンド",
                value: "サーバの管理者のみ，/addを使用することでコマンドを追加できます．"
            },
            {
                name: "音声合成プログラム",
                value: "読み上げ用の音声データ生成にはAquesTalkPiを利用させていただいています．\nhttps://www.a-quest.com/products/aquestalkpi.html"
            },
            {
                name: "困ったら",
                value: `アプデ情報や質問，使い方等はここから: ${tokens.officialServerURL}`
            }
        );

    return guild.systemChannel.send({ embeds: [embed] });
}

//************************************************************************************ */

//サーバから退出したり，サーバが爆散したりしたときの処理
async function onGuildDelete(guild) {
    console.log(`Delete ${guild.name} ${guild.id}`);
    client.user.setActivity(statusMessageGen(getVoiceConnections().size, client.guilds.cache.size), {type: ActivityType.Listening});
    client.channels.cache.get(tokens.newGuildNotifyChannel).send('サーバから退出しました．');

    await deleteGuildData(guild.id);
    // registerSet = JSON.parse(
    //     fs.readFileSync(
    //         path.resolve(__dirname, "../commands.json")
    //     )
    // );

    //消す
    // delete registerSet[guild.id];

    // //非同期，readFileSyncで読み取り済み->上書き
    // fs.writeFile(
    //     path.resolve(__dirname, absolutePath.commands),
    //     JSON.stringify(registerSet, undefined, 4),
    //     "utf-8",
    //     (err) => { if (err) { console.log(err); } }
    // );
    // console.log("delete default commands");

    // const stdout = execSync('node register.js');
    console.log("deleted");

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
    const guildNum = client.guilds.cache.size;
    const members = client.guilds.cache.reduce((a, b) => a + b.memberCount, 0);
    console.table({
        'Bot User:': client.user.tag,
        'Guild(s):': guildNum + 'Servers',
        'Watching:': members + 'Members',
        'Discord.js:': 'v' + require('discord.js').version,
        'Node.js:': process.version,
        'Plattform:': process.platform + '|' + process.arch
    });
    client.user.setActivity(statusMessageGen(getVoiceConnections().size, guildNum), { type: ActivityType.Listening});
    client.channels.cache.get(tokens.bootNotifyChannel).send('起動しました．');
    console.log(process.memoryUsage().heapUsed);

    //15分に1回(毎時0,15,30,45分)，vcで放置されていないかチェック
    // cron.schedule('0,15,30,45 * * * *', () => {
    cron.schedule('0,3,6,9,12,15,18,21,24,27,30,33,36,39,42,45,48,51,54,57 * * * *', () => {
        const now = Date.now();
        const idList = scanQueueMap(now);
        // console.log(idList);
        for (const elem of idList) {
            vcAutoDisconnect(elem);
        }
        client.user.setActivity(statusMessageGen(getVoiceConnections().size, client.guilds.cache.size), {type: ActivityType.Listening});
    });

    //1時間に1回(00分)にコマンドと自動読み上げの回数をファイル出力，ついでに稼働状態をテキストチャンネルに書き込み
    cron.schedule('0 * * * *', () => {
        const reportChannel = client.channels.cache.get(tokens.reportingChannel);
        const now = Date.now();
        const vcMessage = statusMessageGen(getVoiceConnections().size, client.guilds.cache.size);
        if (process.platform == "linux") {
            const tempStdout = execSync('vcgencmd measure_temp');
            const memStdout = execSync('free');
            const mem = process.memoryUsage().heapUsed;
            reportChannel.send(`${now}\n${vcMessage}\n${mem}\n${tempStdout}\n${memStdout}`);
        }
        output(now);
    });

    //3日以上連続稼働した場合の定期再起動
    cron.schedule('0 12 */3 * *', () => {
        console.log("perform periodic reboots.");
        client.channels.cache.get(tokens.bootNotifyChannel).send('定期再起動を実行．')
        .then(() => {
            console.log("reboot!");
            statConfig.reboot += 1;
            fs.writeFileSync(
                path.resolve(__dirname, absolutePath.stat),
                JSON.stringify(statConfig, undefined, 4),
                "utf-8"
            );
        })
        .catch((e) => {
            console.log(e);
        });
    });
});

async function vcAutoDisconnect(elem){
    console.log(`elem:${elem}`);
    const botVcData = await getGuildMap(elem)
    console.log(botVcData);
    const vcdata=await client.channels.cache.get(botVcData.voiceChannelId);
    if(vcdata.userLimit>0){
        await vcdata.setUserLimit(vcdata.userLimit-1);
    }
    await deleteGuildToMap(elem);
    await client.channels.cache.get(botVcData.textChannelId).send('一定時間読み上げ指示が無かったため，切断しました．')
    console.log(`textChannelId:${botVcData.textChannelId}`);
    const botConnection = getVoiceConnection(elem);
    botConnection.destroy();
}

async function onMessage(message) {
    console.log(message.content);

    //token削除
    //参考
    //https://qiita.com/minecraftomato1/items/50fac64d500ea98941f4
    // const startsWithHTTP=message.content.startsWith("http");
    // const findTOKEN=message.content.match(/[a-zA-Z0-9]{23}.[a-zA-Z0-9]{6}/);
    // if (findTOKEN && !startsWithHTTP) {
    //     message.delete()
    //         .then(() => message.channel.send("tokenを検出したため削除"))
    //         .catch(e => message.channel.send(`エラー${e.message}`));
    //     return;
    // }

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

    addAutoSpeechCounter();
    // await talkFunc(message);
    await talkFunc(message.content, message.guildId, message.channel, botConnection, message.member.displayName,message.member.user.id);
    return;
}

client.on("interactionCreate", interaction => onInteraction(interaction)
    .catch(err => {
        errorViewer("interactionCreate",err);
    })
);

client.on("voiceStateUpdate", (oldState, newState) => onVoiceStateUpdate(oldState, newState)
    .catch(err => {
        errorViewer("voiceStateUpdate",err);
    })
);

client.on('guildCreate', guild => onGuildCreate(guild)
    .catch(err => {
        errorViewer('guildCreate',err);
    })
);

client.on('guildDelete', guild => onGuildDelete(guild)
    .catch(err => {
        errorViewer('guildDelete',err);
    })
);

client.on('messageCreate', message => onMessage(message)
    .catch(err => {
        errorViewer('messageCreate',err);
    })
);

client.login(tokens.bot).catch(err => {
    console.error(err);
    process.exit(-1);
});

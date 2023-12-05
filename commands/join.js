const { NoSubscriberBehavior, joinVoiceChannel, getVoiceConnection, createAudioPlayer } = require("@discordjs/voice");
const { addGuildToMap,addMember } = require('../functions/audioMap.js');
const { EmbedBuilder,AttachmentBuilder } = require('discord.js');

var fs = require('fs');
var path = require('path');

var absolutePath = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, "../../path.json")
    )
);

var tokens = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, absolutePath.tokens)
    )
);

module.exports = {
    attr: "base",
    data: {
        name: "join",
        description: "botをvcに参加させる",
    },
    async execute(interaction) {
        //コマンド送信者のVC状況をチェック
        const memberVC = interaction.member.voice.channel;
        const guild = interaction.guild;
        const textChannelId=interaction.channel.id;
        // console.log(`userLimit:${memberVC.userLimit}`)
        // const member = await guild.members.fetch(interaction.member.id);
        // const memberVC = member.voice.channel;

        const botConnection = getVoiceConnection(guild.id);

        //そもそも参加していない場合
        if (!memberVC) {
            const replyMessage = "コマンド送信者がボイスチャットに参加している必要があります．";
            // return interaction.reply(replyMessage);
            return interaction.editReply(replyMessage);
        }
        //botが既に参加している場合
        else if (botConnection != undefined) {
            const replyMessage = "botは既にボイスチャットに接続しています．";
            // return interaction.reply(replyMessage);
            return interaction.editReply(replyMessage);
        }
        //botに音声再生権限が無い場合
        else if (!memberVC.speakable) {
            const replyMessage = "botに音声再生権限がありません．";
            // return interaction.reply(replyMessage);
            return interaction.editReply(replyMessage);
        }
        //vcに人数制限がある場合，制限を拡張しての接続を試行
        else if (memberVC.userLimit!=0) {
            //1<=制限<99の時だけ拡張を実行，99のときは拡張だけスルー．それぞれテキストを差し換え．
            let msg="";
            let isExpand=false;
            if(memberVC.userLimit==99){
                //もし99人参加していたら参加を諦める．
                if(memberVC.full){
                    const replyMessage = "ボイスチャットが満員のため，参加できませんでした．";
                    return interaction.editReply(replyMessage);
                }else{
                    msg="ボイスチャットに参加します(制限人数が99人であり当botが参加するため，参加可能人数は98人となります)．";
                }
            }else{
                msg="ボイスチャットに人数制限があるため，制限人数を拡張してボイスチャンネルに参加します．";
                isExpand=true;
                await memberVC.setUserLimit(memberVC.userLimit+1);
            }
            
            const embed = new EmbedBuilder()
                .setTitle(msg)
                .setColor('#ffff00')
                .addFields(
                    {
                        name: "制限人数を拡張した場合の対応について",
                        value: "当botが退出した際に，自動的に元の数値に戻します．滞在中に何らかのエラーで当botが停止した場合は，お手数ですが手動で人数制限を再設定願います．"
                    },
                    {
                        name: "詳細説明",
                        value: `詳しい使い方やアプデ情報，質問はここから: ${tokens.officialServerURL}`
                    },
                    {
                        name: "音声合成プログラム",
                        value: "読み上げ用音声データ生成にはAquesTalkPiを利用させて頂いています．\nhttps://www.a-quest.com/products/aquestalkpi.html"
                    }
                );
            const connection = joinVoiceChannel({
                guildId: guild.id,
                channelId: memberVC.id,
                adapterCreator: guild.voiceAdapterCreator,
                selfMute: false,
            });
            const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause, } });
            connection.subscribe(player);
            addGuildToMap(guild.me, guild.id,textChannelId, memberVC.id, connection, player,isExpand);
            addMember(guild.id, interaction.user.id, interaction.user.username);

            const attachment = new AttachmentBuilder('../how_to_use.png','how_to_use.png');
            embed.setImage('attachment://how_to_use.png');
            await interaction.editReply("finish!");
            return await interaction.editReply({ files: [attachment], embeds: [embed] });
        }
        //何らかの事情でbotが参加できない場合
        else if (!memberVC.joinable) {
            const replyMessage = "botがボイスチャットに接続できませんでした．";
            // return interaction.reply(replyMessage);
            return interaction.editReply(replyMessage);
        }
        //全部違ったら接続
        else {
            const embed = new EmbedBuilder()
                .setTitle('ボイスチャンネルに参加します')
                .setColor('#0000ff')
                .addFields(
                    // {
                    //     name: "簡単な使い方",
                    //     value: "ボイスチャットに参加している間は，/talk コマンドを使用した書き込みがあった場合ゆっくりボイスで読み上げます．\n詳しい使い方は下記のサーバからどうぞ．"
                    // },
                    {
                        name: "詳細説明",
                        value: `詳しい使い方やアプデ情報，質問はここから: ${tokens.officialServerURL}`
                    },
                    {
                        name: "音声合成プログラム",
                        value: "読み上げ用音声データ生成にはAquesTalkPiを利用させて頂いています．\nhttps://www.a-quest.com/products/aquestalkpi.html"
                    }
                );
            const connection = joinVoiceChannel({
                guildId: guild.id,
                channelId: memberVC.id,
                adapterCreator: guild.voiceAdapterCreator,
                selfMute: false,
            });
            const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause, } });
            connection.subscribe(player);
            addGuildToMap(guild.me, guild.id,textChannelId, memberVC.id, connection, player,false);
            addMember(guild.id, interaction.user.id, interaction.user.username);

            const attachment = new AttachmentBuilder('../how_to_use.png','how_to_use.png');
            embed.setImage('attachment://how_to_use.png');
            await interaction.editReply(`${interaction.user.username}さんを読み上げ対象に追加しました．/ttslist statusでリストを確認できます．\n読み上げさせずにテキストチャットへの書き込みをしたい場合は/noread コマンドを使用してください．`);
            return await interaction.editReply({ files: [attachment], embeds: [embed] });
            // return interaction.reply(replyMessage);
        }
    }
}
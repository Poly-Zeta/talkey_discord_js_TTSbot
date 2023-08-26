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
        //vcが満員でbotが参加できない場合
        else if (memberVC.full) {
            const replyMessage = "ボイスチャットが満員となっているため，botがボイスチャットに接続できませんでした．";
            // return interaction.reply(replyMessage);
            return interaction.editReply(replyMessage);
        }
        //何らかの事情でbotが参加できない場合
        else if (!memberVC.joinable) {
            const replyMessage = "botがボイスチャットに接続できませんでした．";
            // return interaction.reply(replyMessage);
            return interaction.editReply(replyMessage);
        }
        //botに音声再生権限が無い場合
        else if (!memberVC.speakable) {
            const replyMessage = "botに音声再生権限がありません．";
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
            addGuildToMap(guild.me, guild.id,textChannelId, memberVC.id, connection, player);
            addMember(guild.id, interaction.user.id, interaction.user.username);

            const attachment = new AttachmentBuilder('../how_to_use.png','how_to_use.png');
            embed.setImage('attachment://how_to_use.png');
            await interaction.editReply("finish!");
            return await interaction.editReply({ files: [attachment], embeds: [embed] });
            // return interaction.reply(replyMessage);
        }
    }
}
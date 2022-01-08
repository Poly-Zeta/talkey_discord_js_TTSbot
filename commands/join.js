const { NoSubscriberBehavior, joinVoiceChannel, getVoiceConnection, createAudioPlayer } = require("@discordjs/voice");
const { addGuildToMap } = require('../functions/audioMap.js');
const { MessageEmbed } = require('discord.js');

var fs = require('fs');
var path = require('path');

var tokens = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, "../../tokens.json")
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
        // const member = await guild.members.fetch(interaction.member.id);
        // const memberVC = member.voice.channel;

        const botConnection = getVoiceConnection(interaction.guild.id);

        //そもそも参加していない場合
        if (!memberVC) {
            const replyMessage = "コマンド送信者がボイスチャットに参加している必要があります．";
            return interaction.reply(replyMessage);
        }
        //botが既に参加している場合
        else if (botConnection != undefined) {
            const replyMessage = "botは既にボイスチャットに接続しています．";
            return interaction.reply(replyMessage);
        }
        //botが参加できない場合
        else if (!memberVC.joinable) {
            const replyMessage = "botがボイスチャットに接続できませんでした．";
            return interaction.reply(replyMessage);
        }
        //botに音声再生権限が無い場合
        else if (!memberVC.speakable) {
            const replyMessage = "botに音声再生権限がありません．";
            return interaction.reply(replyMessage);
        }
        //全部違ったら接続
        else {
            const embed = new MessageEmbed()
                .setTitle('ボイスチャンネルに参加します')
                .setColor('#0000ff')
                .addFields(
                    {
                        name: "使い方",
                        value: "ボイスチャットに参加している間は，/talkコマンドでの書き込みを読み上げます．"
                    },
                    {
                        name: "広告",
                        value: `アプデ情報や質問等はここから: ${tokens.officialServerURL}`
                    },
                    {
                        name: "告知",
                        value: "2022/01/07 21:48 ボイチャ同時読み上げできるようになったはず，んで相変わらずバグや動作停止が起きると思います．適宜連絡ください．"
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
            addGuildToMap(guild.id, memberVC.id, connection, player);
            return interaction.reply({ embeds: [embed] });
            // return interaction.reply(replyMessage);
        }
    }
}
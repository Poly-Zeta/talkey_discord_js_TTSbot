const { NoSubscriberBehavior, joinVoiceChannel, getVoiceConnection, createAudioPlayer } = require("@discordjs/voice");
const { addGuildToMap } = require('../functions/audioMap.js');

module.exports = {
    attr: "additional",
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
            const replyMessage = "vcに接続します. 2022/01/03 20:59 大幅にソースコードをいじったので，そこらじゅうでバグや動作停止が起きると思います．適宜連絡ください．";
            const connection = joinVoiceChannel({
                guildId: guild.id,
                channelId: memberVC.id,
                adapterCreator: guild.voiceAdapterCreator,
                selfMute: false,
            });
            const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause, } });
            connection.subscribe(player);
            addGuildToMap(guild.id, memberVC.id, connection, player);
            return interaction.reply(replyMessage);
        }
    }
}
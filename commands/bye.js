const { getVoiceConnection } = require("@discordjs/voice");
const { deleteGuildToMap } = require('../functions/audioMap.js');

module.exports = {
    attr: "additional",
    data: {
        name: "bye",
        description: "botをvcから退出させる",
    },
    async execute(interaction) {
        //コマンド送信者のVC状況をチェック
        // const guild = interaction.guild;
        // const member = await guild.members.fetch(interaction.member.id);
        const memberVC = interaction.member.voice.channel;
        const botConnection = getVoiceConnection(interaction.guild.id);

        //コマンド送信者がそもそも参加していない場合
        if (!memberVC) {
            const replyMessage = "コマンド送信者がボイスチャットに参加している必要があります．";
            return interaction.reply(replyMessage);
        }
        //botがそもそも参加していない場合
        else if (botConnection == undefined) {
            const replyMessage = "botはボイスチャットに接続していません．";
            return interaction.reply(replyMessage);
        }
        //->botが同じvcに接続しているか？
        else if (botConnection.joinConfig.channelId != memberVC.id) {
            const replyMessage = "botと同じボイスチャットに参加していないユーザーは，botを退出させることができません．";
            return interaction.reply(replyMessage);
        }
        //->connection.destroy()
        else {
            //全部違ったら退出
            botConnection.destroy();
            deleteGuildToMap(interaction.guild.id);
            const replyMessage = "退出します．";
            return interaction.reply(replyMessage);
        }
        // return interaction.reply("test");
    }
}
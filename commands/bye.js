const { getVoiceConnection } = require("@discordjs/voice");
const { deleteGuildToMap } = require('../functions/audioMap.js');

module.exports = {
    attr: "base",
    data: {
        name: "bye",
        description: "botをvcから退出させる",
    },
    async execute(interaction) {
        const memberVC = interaction.member.voice.channel;
        const botConnection = getVoiceConnection(interaction.guild.id);

        //botがvcに参加していない場合
        if (botConnection == undefined) {
            const replyMessage = "botはボイスチャットに接続していません．";
            return interaction.reply(replyMessage);
        }
        //異なるvcからコマンドを送ってきた場合
        else if (botConnection.joinConfig.channelId != memberVC.id) {
            const replyMessage = "botと同じボイスチャットに参加していないユーザーは，botを退出させることができません．";
            return interaction.reply(replyMessage);
        }
        else {
            //全部違ったら退出
            botConnection.destroy();
            deleteGuildToMap(interaction.guild.id);
            const replyMessage = "退出します．";
            return interaction.reply(replyMessage);
        }
    }
}
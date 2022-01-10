const { getVoiceConnection } = require("@discordjs/voice");
const { addMember, deleteMember, getGuildMap } = require('../functions/audioMap.js');
const { MessageEmbed } = require('discord.js');

module.exports = {
    attr: "base",
    data: {
        name: "ttslist",
        description: "/talkを使わなくても読み上げされるユーザのリストを編集する．botがサーバ内のボイスチャットに参加している必要がある．",
        options: [
            {
                type: "SUB_COMMAND",
                name: "add",
                description: "リストにコマンド送信者を登録する",
            },
            {
                type: "SUB_COMMAND",
                name: "delete",
                description: "リストからコマンド送信者を除外する",
            },
            {
                type: "SUB_COMMAND",
                name: "status",
                description: "リストの状態を確認する",
            },
        ]
    },
    async execute(interaction) {
        const botConnection = getVoiceConnection(interaction.guild.id);

        if (botConnection == undefined) {
            const replyMessage = "botがボイスチャットに参加している必要があります．";
            return interaction.reply(replyMessage);
        }

        const subCommand = interaction.options.getSubcommand(false);
        console.log(subCommand);

        if (subCommand == "add") {
            addMember(interaction.guild.id, interaction.user.id);
            return interaction.reply(`${interaction.user.username}さんを読み上げ対象に追加しました．/ttslist statusでリストを確認できます．`);
        } else if (subCommand == "delete") {
            deleteMember(interaction.guild.id, interaction.user.id);
            return interaction.reply(`${interaction.user.username}さんを読み上げ対象から除外しました．/ttslist statusでリストを確認できます．`);
        } else if (subCommand == "status") {
            const guildData = getGuildMap(interaction.guild.id);
            const embed = new MessageEmbed()
                .setTitle('読み上げ対象')
                .setColor('#0000ff')
                .addFields(
                    {
                        name: "読み上げ内容を再生するボイスチャット",
                        value: `${interaction.guild.name}`
                    },
                    {
                        name: "メッセージ読み上げ対象者一覧",
                        value: `${guildData.memberId}`
                    },
                    {
                        name: "追記",
                        value: "読み上げ対象者リストの操作にはttslistコマンドを使用してください．\nまた，対象者でもnoreadコマンドで読み上げさせずにテキストチャットへの書き込みが可能です．\nbotがボイスチャットから退出した場合には，リストは破棄されます．"
                    }
                );
            return interaction.reply({ embeds: [embed] });
        } else {
            reply = "エラー";
        }
    }
}
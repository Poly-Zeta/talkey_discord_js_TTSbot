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
                type: "STRING",
                name: "option",
                description: "add->コマンド実行者をリストに登録．delete->コマンド実行者をリストから削除．",
                required: true,
                choices: [
                    {
                        name: "add",
                        value: "add"
                    },
                    {
                        name: "delete",
                        value: "delete"
                    },
                    {
                        name: "status",
                        value: "status"
                    }
                ],
            }
        ]
        // options: [
        //     {
        //         type: "SUB_COMMAND",
        //         name: "add",
        //         description: "リストにコマンド送信者を登録する",
        //     },
        //     {
        //         type: "SUB_COMMAND",
        //         name: "delete",
        //         description: "リストからコマンド送信者を除外する",
        //     },
        //     {
        //         type: "SUB_COMMAND",
        //         name: "status",
        //         description: "リストの状態を確認する",
        //     },
        // ]
    },
    async execute(interaction) {
        const botConnection = getVoiceConnection(interaction.guild.id);

        if (!interaction.member.voice.channel) {
            const replyMessage = "コマンド送信者がボイスチャットに参加している必要があります．";
            return interaction.reply(replyMessage);
        }

        if (botConnection == undefined) {
            const replyMessage = "botがボイスチャットに参加している必要があります．/joinでbotを参加させることができます．";
            return interaction.reply(replyMessage);
        }

        //異なるvcからコマンドを送ってきた場合
        if (botConnection.joinConfig.channelId != interaction.member.voice.channel.id) {
            const replyMessage = "botと同じボイスチャットに参加していないユーザーは，botを退出させることができません．";
            return interaction.reply(replyMessage);
        }

        // const subCommand = interaction.options.getSubcommand(false);
        const subCommand = interaction.options.get("option").value;
        console.log(subCommand);
        const guildData = await getGuildMap(interaction.guild.id);
        // console.log(`ttslist:guildData.memberId:${guildData.memberId}`);
        // console.log(`guildData[memberId]:${guildData[memberId]}`);
        // console.log(`guildData['memberId']:${guildData["memberId"]}`);

        if (subCommand == "add") {
            if (guildData.memberId !== undefined) {
                if (guildData.memberId.has(interaction.user.id)) {
                    return interaction.reply(`${interaction.user.username}さんは既に読み上げ対象です．/ttslist statusでリストを確認できます．`);
                }
                // if (guildData.memberId.includes(interaction.user.id)) {
                //     return interaction.reply(`${interaction.user.username}さんは既に読み上げ対象です．/ttslist statusでリストを確認できます．`);
                // }
            }
            // console.log(interaction.username);
            addMember(interaction.guild.id, interaction.user.id, interaction.user.username);
            // addMember(interaction.guild.id, interaction.user.id);
            return interaction.reply(`${interaction.user.username}さんを読み上げ対象に追加しました．/ttslist statusでリストを確認できます．`);

        } else if (subCommand == "delete") {
            if (guildData.memberId.size == 0) {
                return interaction.reply(`空のリストからユーザを削除することはできません．/ttslist statusでリストを確認できます．`);
            }
            if (!guildData.memberId.has(interaction.user.id)) {
                return interaction.reply(`${interaction.user.username}さんは読み上げ対象ではありません．/ttslist statusでリストを確認できます．`);
            }
            deleteMember(interaction.guild.id, interaction.user.id);
            return interaction.reply(`${interaction.user.username}さんを読み上げ対象から除外しました．/ttslist statusでリストを確認できます．`);
        } else if (subCommand == "status") {
            // const guildData = getGuildMap(interaction.guild.id);
            await interaction.reply("working!");
            const nameList = (guildData.memberId.size == 0) ? "無し" : [...guildData.memberId.values()];
            // const nameList=guildData.memberId.forEach(element => {

            // });
            const embed = new MessageEmbed()
                .setTitle('読み上げ対象')
                .setColor('#0000ff')
                .addFields(
                    {
                        name: "読み上げ内容を再生するボイスチャット",
                        value: `${interaction.guild.name}:${interaction.member.voice.channel.name}`
                    },
                    {
                        name: "メッセージ読み上げ対象者一覧",
                        value: `${nameList}`
                    },
                    {
                        name: "追記",
                        value: "読み上げ対象者リストの操作にはttslistコマンドを使用してください．\nまた，対象者でもnoreadコマンドで読み上げさせずにテキストチャットへの書き込みが可能です．\nbotがボイスチャットから退出した場合には，リストは破棄されます．"
                    }
                );
            await interaction.editReply("finish!");
            return await interaction.editReply({ embeds: [embed] });
        } else {
            reply = "エラー";
        }
    }
}

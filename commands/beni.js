const { textOperator } = require('../functions/textOperator.js');
const { addAudioToQueue, playAudio, isPlaying } = require('../functions/audio.js');
const { joinVoiceChannel, entersState, VoiceConnectionStatus, createAudioResource, StreamType, createAudioPlayer, AudioPlayerStatus, NoSubscriberBehavior, generateDependencyReport, getVoiceConnection } = require("@discordjs/voice");
module.exports = {
    attr: "additional",
    data: {
        name: "beni",
        description: "某身内ミームを表示する",
        options: [
            {
                type: "SUB_COMMAND",
                name: "normal",
                description: "通常バージョン",
            },
            {
                type: "SUB_COMMAND",
                name: "insert",
                description: "内容を一部差し換える",
                options: [
                    {
                        type: "STRING",
                        name: "text",
                        description: "差し替え先",
                        required: true
                    }
                ]
            },
            {
                type: "SUB_COMMAND",
                name: "long",
                description: "ロングバージョン",
            }
        ]
    },
    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand(false);
        const botConnection = getVoiceConnection(interaction.guild.id);
        console.log(subCommand);
        let reply = "";

        if (subCommand == "normal") {
            reply = "ﾝﾜﾜﾜﾜﾜﾎﾟﾎﾟｯｺﾁｭｧｱｱｱｱ";
        } else if (subCommand == "insert") {
            reply = `ﾝﾜﾜﾜﾜﾜ${interaction.options.get("text").value}ﾁｭｧｱｱｱｱ`;
        } else if (subCommand == "long") {
            reply = "ﾝﾜﾜﾜﾜﾜﾎﾟﾎﾟｯｺﾁｭｧｱｱｱｱ！！！！！！！！ﾜﾁｬｯｺ……ﾜﾁｬｯｺﾁｭｧｱ…………ﾊﾈｺﾁｭｱ…………………ﾝﾜﾜﾜﾜﾜ……ﾝﾜﾜﾜﾜﾜｷｬﾜﾖｷｬﾜﾖ…………ｷｬﾜｷｬﾜﾀﾞﾈｪ……ﾅﾝﾃﾞｺﾝﾅﾆｶﾜｲｲﾉｫ！！！！！！！ｷｬﾜ……ﾝｷﾞｬﾜﾀﾞﾈｪ…………………";
        } else {
            reply = "エラー";
        }
        if (botConnection != undefined) {
            const tts = textOperator(reply);
            addAudioToQueue(tts, botConnection, "f1");
            if (!isPlaying) {
                playAudio();
            }
        }
        return interaction.reply(reply);
    }
}
const { sendMessage } = require('../functions/sendMessage.js');
const { textOperator } = require('../functions/textOperator.js');
const { getResponseofTalkAPI } = require('../functions/talkapi.js');
const { getVoiceConnection } = require("@discordjs/voice");
const { addTalkCommandCounter } = require('../functions/talkLog.js');
const { talkFunc } = require('../functions/talkFunc.js');

module.exports = {
    attr: "base",
    data: {
        name: "talk",
        description: "このコマンドの引数をbotが読み上げる",
        options: [
            {
                type: "STRING",
                name: "message",
                description: "読み上げさせたいテキスト",
                required: true
            }
        ]
    },
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const namePattern = /たーきーちゃん|ターキーちゃん|たーきーくん|ターキーくん/;
        const botConnection = getVoiceConnection(guildId);
        
        //引数のメッセージを取得
        let readTxt = interaction.options.get("message").value;
        
        //interactionに返答しないとアプリ側にエラーが出てうざい
        //ので適当に返信してすぐ消す
        //ここが返信
        // await interaction.reply({ content: readTxt, ephemeral: false })
        //     // .then(console.log)
        //     .catch(console.error);
        //こっちで消す
        await interaction.deleteReply()
            // .then(console.log)
            .catch(console.error);


        //ユーザアカウントに偽装したwebhookを送る
        await sendMessage("🔊", interaction).catch(e => console.error(e));
        if (botConnection != undefined) {
            addTalkCommandCounter();
        }

        await talkFunc(readTxt, guildId, interaction.channel, botConnection, interaction.member.displayName,interaction.user.id);

        return;
    }
}
const { sendMessage } = require('../functions/sendMessage.js');
const { textOperator } = require('../functions/textOperator.js');
const { getResponseofTalkAPI } = require('../functions/talkapi.js');
const { getVoiceConnection } = require("@discordjs/voice");
const { addTalkCommandCounter } = require('../functions/talkLog.js');
const { talkToBotFunc,talkToLlamaFunc } = require('../functions/talkFunc.js');

module.exports = {
    attr: "base",
    data: {
        name: "talktobot",
        description: "botと会話する",
        options: [
            {
                type: 3,//"STRING",
                name: "saying",
                description: "botに話しかける内容",
                required: true
            },
            {
                type:5,//"BOOLIAN",
                name:"opt",
                description: "falseのとき，成形処理をスキップして出力(無入力の際はtrueで実行)",
                required:false,
            }
        ]
    },
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const namePattern = /たーきーちゃん|ターキーちゃん|たーきーくん|ターキーくん/;
        const botConnection = getVoiceConnection(guildId);
        
        //引数のメッセージを取得
        let readTxt = interaction.options.get("saying").value;
        
        await interaction.deleteReply()
            // .then(console.log)
            .catch(console.error);


        //ユーザアカウントに偽装したwebhookを送る
        await sendMessage("🗣️", interaction,readTxt).catch(e => console.error(e));
        if (botConnection != undefined) {
            addTalkCommandCounter();
        }

        const doMoldProcess=interaction.options.get("opt",false);
        let doMoldProcessFlg=true;
        if(doMoldProcess!==null){
            doMoldProcessFlg=doMoldProcess.value;
            console.log(`opt:${doMoldProcessFlg}`);
        }

        // await talkToBotFunc(readTxt, guildId, interaction.channel, botConnection, interaction.member.displayName,interaction.user.id);
        await talkToLlamaFunc(interaction,readTxt, guildId,interaction.channel, botConnection, interaction.member.displayName,interaction.user.id,doMoldProcessFlg);

        return;
    }
}
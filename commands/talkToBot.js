const { sendMessage } = require('../functions/sendMessage.js');
const { textOperator } = require('../functions/textOperator.js');
const { getResponseofTalkAPI } = require('../functions/talkapi.js');
const { getVoiceConnection } = require("@discordjs/voice");
const { addTalkCommandCounter } = require('../functions/talkLog.js');
const { talkToBotFunc,talkToLlamaFunc } = require('../functions/talkFunc.js');
const { getLLMQueueLength } = require('../functions/llmMap.js');
const { ndnDiceRoll } = require('../functions/diceroll.js');

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
                type: 3,//"STRING",
                name: "model",
                description: "回答生成に使用するモデルの選択(無入力の際はランダムで実行)",
                required: false,
                choices: [
                    {
                        name: "ランダム(3種のモデルをランダム選択)",
                        value: "random",
                    },
                    {
                        name: "高速(ELYZA-7bを使用@2023/12/04)",
                        value: "light",
                    },
                    {
                        name: "中程度(Wizard-vicuna-30bを使用@2023/12/04)",
                        value: "middle",
                    },
                    {
                        name: "低速(Xwin-LM-70bを使用@2023/12/04)",
                        value: "heavy",
                    },
                ]
            },
            {
                type:5,//"BOOLIAN",
                name:"opt",
                description: "falseのとき，成形処理をスキップして出力(無入力の際はtrueで実行)",
                required:false,
            },
            {
                type:5,//"BOOLIAN",
                name:"logreset",
                description: "trueのとき，コマンド実行ギルドの会話履歴をクリア(無入力の際はfalseで実行)",
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
        let getModel = interaction.options.get("model");
        let model="random";
        if(getModel!=null){
            model=getModel.value;
        }
        if(model=="random"){
            const models=["light","middle","heavy"];
            const ans = ndnDiceRoll(1, 3);
            model=models[ans-1];
        }
        
        await interaction.deleteReply()
            // .then(console.log)
            .catch(console.error);


        //ユーザアカウントに偽装したwebhookを送る
        const waitlistLength=getLLMQueueLength();
        const msgopt=`(待機件数:${waitlistLength+1}，予想処理時間${(waitlistLength+1)*5}分)`
        await sendMessage("🗣️", interaction,`${model},${readTxt}${msgopt}`).catch(e => console.error(e));
        if (botConnection != undefined) {
            addTalkCommandCounter();
        }

        const doMoldProcess=interaction.options.get("opt",false);
        let doMoldProcessFlg=true;
        if(doMoldProcess!==null){
            doMoldProcessFlg=doMoldProcess.value;
            console.log(`opt:${doMoldProcessFlg}`);
        }

        const doTalkLogReset=interaction.options.get("logreset",false);
        let doTalkLogResetFlg=false;
        if(doTalkLogReset!==null){
            doTalkLogResetFlg=doTalkLogReset.value;
        }
        console.log(`reset:${doTalkLogResetFlg}`);

        // await talkToBotFunc(readTxt, guildId, interaction.channel, botConnection, interaction.member.displayName,interaction.user.id);
        await talkToLlamaFunc(readTxt, guildId,interaction.channel, botConnection, interaction.member.displayName,interaction.user.id,doMoldProcessFlg,doTalkLogResetFlg);

        return;
    }
}
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

        //ユーザアカウントに偽装したwebhookを送る
        await sendMessage("🔊", interaction).catch(e => console.error(e));
        if (botConnection != undefined) {
            addTalkCommandCounter();
        }
        //interactionに返答しないとアプリ側にエラーが出てうざい
        //ので適当に返信してすぐ消す
        //ここが返信
        await interaction.reply({ content: readTxt, ephemeral: false })
            // .then(console.log)
            .catch(console.error);
        //こっちで消す
        await interaction.deleteReply()
            // .then(console.log)
            .catch(console.error);

        await talkFunc(readTxt, guildId, interaction.channel, botConnection, interaction.member.displayName);

        // //色々除去
        // readTxt = textOperator(readTxt);
        // // console.log(`chk1: ${readTxt}`);

        // //名前があるかどうかで挙動を変える
        // if (namePattern.test(readTxt)) {
        //     //名前があったら，ボイチャに接続しているかを確認してf2ボイスにしてqueueに追加
        //     if (botConnection != undefined) {
        //         addAudioToMapQueue(interaction.guild.id, readTxt, "f2");
        //     }

        //     // console.log(`namechk: ${readTxt}`);

        //     //名前を適宜差し替えた文を生成->ちょっと無効化しておく
        //     // const nameRepraceThrethold = Math.floor(Math.random() * 100);
        //     // if (nameRepraceThrethold < 100) {
        //     readTxt = readTxt.replace(namePattern, "");
        //     // } else {
        //     //     readTxt = readTxt.replace(namePattern, "あなた");
        //     // }
        //     // console.log(readTxt);
        //     // return interaction.reply(`名前を呼ばれた場合のテスト: ${readTxt}`);

        //     //a3rtに投げる
        //     const apiResponseText = await getResponseofTalkAPI(readTxt);

        //     //ボイチャに接続している場合は応答をf1ボイスにしてqueueに投げる
        //     if (botConnection != undefined) {
        //         addTalkCommandCounter();
        //         addAudioToMapQueue(interaction.guild.id, apiResponseText, "f1");
        //     }
        //     //応答をreplyで返す
        //     interaction.channel.send(apiResponseText);
        // } else {
        //     // console.log("chk3");
        //     //名前が無ければ，ボイチャに接続しているかを確認して入力をそのままf1ボイスでqueueに追加
        //     if (botConnection != undefined) {
        //         addTalkCommandCounter();
        //         addAudioToMapQueue(interaction.guild.id, readTxt, "f1");
        //     }
        // }

        return;
    }
}
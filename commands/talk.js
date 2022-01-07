const { sendMessage } = require('../functions/sendMessage.js');
const { textOperator } = require('../functions/textOperator.js');
const { getResponseofTalkAPI } = require('../functions/talkapi.js');
const { getVoiceConnection } = require("@discordjs/voice");
const { addAudioToMapQueue } = require('../functions/audioMap.js');

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
        const namePattern = /たーきーちゃん|ターキーちゃん|たーきーくん|ターキーくん/;
        const botConnection = getVoiceConnection(interaction.guild.id);
        // if (botConnection == undefined) {
        //     return interaction.reply("読み上げを行うためにはbotがボイスチャットに参加している必要があります．");
        // }

        //ユーザアカウントに偽装したwebhookを送る
        await sendMessage(interaction).catch(e => console.error(e));

        //引数のメッセージを取得
        let readTxt = interaction.options.get("message").value;
        //色々除去
        readTxt = textOperator(readTxt);
        console.log(`chk1: ${readTxt}`);

        //名前があるかどうかで挙動を変える
        if (namePattern.test(readTxt)) {
            //名前があったら，ボイチャに接続しているかを確認してf2ボイスにしてqueueに追加
            if (botConnection != undefined) {
                // addAudioToQueue(readTxt, botConnection, "f2");
                addAudioToMapQueue(interaction.guild.id, readTxt, "f2");
                // if (!isPlaying) {
                //     playAudio();
                // }
            }

            console.log(`namechk: ${readTxt}`);

            //名前を適宜差し替えた文を生成
            const nameRepraceThrethold = Math.floor(Math.random() * 100);
            if (nameRepraceThrethold < 80) {
                readTxt = readTxt.replace(namePattern, "");
            } else {
                readTxt = readTxt.replace(namePattern, "あなた");
            }
            // console.log(readTxt);
            // return interaction.reply(`名前を呼ばれた場合のテスト: ${readTxt}`);

            //a3rtに投げる
            const apiResponseText = await getResponseofTalkAPI(readTxt);

            //ボイチャに接続している場合は応答をf1ボイスにしてqueueに投げる
            if (botConnection != undefined) {
                // addAudioToMap(apiResponseText, botConnection, "f1");
                addAudioToMapQueue(interaction.guild.id, readTxt, "f1");
                // if (!isPlaying) {
                //     playAudio();
                // }
            }
            //応答をreplyで返す
            // return interaction.reply(apiResponseText);
            interaction.channel.send(apiResponseText);
        } else {
            console.log("chk3");
            //名前が無ければ，ボイチャに接続しているかを確認して入力をそのままf1ボイスでqueueに追加
            if (botConnection != undefined) {
                // addAudioToQueue(readTxt, botConnection, "f1");
                addAudioToMapQueue(interaction.guild.id, readTxt, "f1");
                // if (!isPlaying) {
                //     playAudio();
                // }
            }
        }

        //ここまでで必要な動作は全て済んでいるが，interactionに返答しないとアプリ側にエラーが出てうざい
        //ので適当に返信してすぐ消す
        //ここが返信
        await interaction.reply({ content: interaction.options.get("message").value, ephemeral: false })
            .then(console.log)
            .catch(console.error);
        //こっちで消す
        await interaction.deleteReply()
            .then(console.log)
            .catch(console.error);
        return;
    }
}
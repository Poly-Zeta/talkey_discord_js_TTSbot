const { getVoiceConnection } = require("@discordjs/voice");
const { addAudioToMapQueue } = require('../functions/audioMap.js');
const { textOperator } = require('../functions/textOperator.js');
const { getResponseofTalkAPI } = require('../functions/talkapi.js');

async function talkFunc(message) {
    const namePattern = /たーきーちゃん|ターキーちゃん|たーきーくん|ターキーくん/;
    const botConnection = getVoiceConnection(message.guildId);

    //引数のメッセージを取得
    let readTxt = message.content;
    //色々除去
    readTxt = textOperator(readTxt);
    console.log(`chk1: ${readTxt}`);

    //名前があるかどうかで挙動を変える
    if (namePattern.test(readTxt)) {
        //名前があったら，ボイチャに接続しているかを確認してf2ボイスにしてqueueに追加
        if (botConnection != undefined) {
            addAudioToMapQueue(message.guildId, readTxt, "f2");
        }

        console.log(`namechk: ${readTxt}`);

        readTxt = readTxt.replace(namePattern, "");

        //a3rtに投げる
        const apiResponseText = await getResponseofTalkAPI(readTxt);

        //ボイチャに接続している場合は応答をf1ボイスにしてqueueに投げる
        if (botConnection != undefined) {
            addAudioToMapQueue(message.guildId, apiResponseText, "f1");
        }
        //応答をreplyで返す
        message.channel.send(apiResponseText);
    } else {
        console.log("chk3");
        //名前が無ければ，ボイチャに接続しているかを確認して入力をそのままf1ボイスでqueueに追加
        if (botConnection != undefined) {
            addAudioToMapQueue(message.guildId, readTxt, "f1");
        }
    }
    return;
}

module.exports = {
    talkFunc
}
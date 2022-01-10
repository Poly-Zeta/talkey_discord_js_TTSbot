const { getGuildMap } = require('../functions/audioMap.js');

async function talkFunc(guildId, textChannelId, message) {
    const namePattern = /たーきーちゃん|ターキーちゃん|たーきーくん|ターキーくん/;
    const botConnection = getVoiceConnection(guildId);
    const messageSendChannel = client.channels.cache.get(textChannelId);

    //引数のメッセージを取得
    let readTxt = message;
    //色々除去
    readTxt = textOperator(readTxt);
    console.log(`chk1: ${readTxt}`);

    //名前があるかどうかで挙動を変える
    if (namePattern.test(readTxt)) {
        //名前があったら，ボイチャに接続しているかを確認してf2ボイスにしてqueueに追加
        if (botConnection != undefined) {
            addAudioToMapQueue(guildId, readTxt, "f2");
        }

        console.log(`namechk: ${readTxt}`);

        //名前を適宜差し替えた文を生成->ちょっと無効化しておく
        // const nameRepraceThrethold = Math.floor(Math.random() * 100);
        // if (nameRepraceThrethold < 100) {
        readTxt = readTxt.replace(namePattern, "");
        // } else {
        //     readTxt = readTxt.replace(namePattern, "あなた");
        // }
        // console.log(readTxt);
        // return interaction.reply(`名前を呼ばれた場合のテスト: ${readTxt}`);

        //a3rtに投げる
        const apiResponseText = await getResponseofTalkAPI(readTxt);

        //ボイチャに接続している場合は応答をf1ボイスにしてqueueに投げる
        if (botConnection != undefined) {
            addAudioToMapQueue(guildId, apiResponseText, "f1");
        }
        //応答をreplyで返す
        messageSendChannel.send(apiResponseText);
    } else {
        console.log("chk3");
        //名前が無ければ，ボイチャに接続しているかを確認して入力をそのままf1ボイスでqueueに追加
        if (botConnection != undefined) {
            addAudioToMapQueue(guildId, readTxt, "f1");
        }
    }
    return;
}

module.exports = {
    talkFunc
}
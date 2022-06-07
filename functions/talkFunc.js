const { addAudioToMapQueue } = require('../functions/audioMap.js');
const { textOperator } = require('../functions/textOperator.js');
const { getResponseofTalkAPI ,getResponseofChaplus,getResponseofMebo} = require('../functions/talkapi.js');

// async function talkFunc(message) {
async function talkFunc(readTxt, guildId, textChannel, botConnection, nickname,uid) {
    const namePattern = /たーきーちゃん|ターキーちゃん|たーきーくん|ターキーくん/;
    // const botConnection = getVoiceConnection(message.guildId);

    // //引数のメッセージを取得
    // let readTxt = message.content;
    //色々除去
    readTxt = textOperator(readTxt);
    // console.log(`chk1: ${readTxt}`);

    //名前があるかどうかで挙動を変える
    if (namePattern.test(readTxt)) {
        //名前があったら，ボイチャに接続しているかを確認してf2ボイスにしてqueueに追加
        if (botConnection != undefined) {
            addAudioToMapQueue(guildId, nickname, readTxt, "f2");
        }

        // console.log(`namechk: ${readTxt}`);
        var apiResponseText="";
        const apiRandomizer = Math.floor(Math.random() * 100);
        readTxt = readTxt.replace(namePattern, "talkeyちゃん");
        apiResponseText = await getResponseofMebo(readTxt,uid);
        // if (apiRandomizer< 40) {
        //     console.log("chaplus");
        //     readTxt = readTxt.replace(namePattern, "たーきーちゃん");
        //     apiResponseText = await getResponseofChaplus(readTxt,nickname);
        // }else{
        //     console.log("a3rt");
        //     readTxt = readTxt.replace(namePattern, "");
        //     //a3rtに投げる
        //     apiResponseText = await getResponseofTalkAPI(readTxt);
        // }

        //ボイチャに接続している場合は応答をf1ボイスにしてqueueに投げる
        if (botConnection != undefined) {
            addAudioToMapQueue(guildId, "たーきーちゃん", apiResponseText, "f1");
        }
        //応答をreplyで返す
        textChannel.send(apiResponseText);
    } else {
        // console.log("chk3");
        //名前が無ければ，ボイチャに接続しているかを確認して入力をそのままf1ボイスでqueueに追加
        if (botConnection != undefined) {
            addAudioToMapQueue(guildId, nickname, readTxt, "f1");
        }
    }
    return;
}

module.exports = {
    talkFunc
}
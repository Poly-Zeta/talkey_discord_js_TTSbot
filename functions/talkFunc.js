const { addAudioToMapQueue } = require('../functions/audioMap.js');
const { addLlamaQueue } = require('../functions/llmMap.js');
const { textOperator } = require('../functions/textOperator.js');
const { getResponseofTalkAPI ,getResponseofChaplus,getResponseofMebo} = require('../functions/talkapi.js');

async function talkToLlamaFunc(readTxt, guildId, textChannel, botConnection, nickname,uid) {
    //talkToBotFuncでは応答までこの関数内で片づけるが，スタックの都合この関数ではQueue実行までとする
    //入力->ユーザ書き込みの読み上げ->llama用に名前の下処理->llamaのスタック登録->終了とし
    //応答や応答読み上げはスタック処理に任せる
    const namePattern = /たーきーちゃん|ターキーちゃん|たーきーくん|ターキーくん/;

    if (botConnection != undefined) {
        //色々除去
        const readreq = textOperator(readTxt);
        addAudioToMapQueue(guildId, nickname, readreq, "f2");
    }

    readTxt = readTxt.replace(namePattern, "talkey-chan");
    await addLlamaQueue(guildId, nickname, readTxt, uid,textChannel,botConnection);
    
    return;
}


// async function talkFunc(message) {
async function talkFunc(readTxt, guildId, textChannel, botConnection, nickname,uid) {
    const namePattern = /たーきーちゃん|ターキーちゃん|たーきーくん|ターキーくん/;

    //名前があるかどうかで挙動を変える
    if (namePattern.test(readTxt)) {
        textChannel.sendTyping();
        //名前があったら，ボイチャに接続しているかを確認してf2ボイスにしてqueueに追加
        if (botConnection != undefined) {
            //色々除去
            const readreq = textOperator(readTxt);
            addAudioToMapQueue(guildId, nickname, readreq, "f2");
        }

        // console.log(`namechk: ${readTxt}`);
        var apiResponseText="";
        const apiRandomizer = Math.floor(Math.random() * 100);

        if (apiRandomizer< 70) {
            readTxt = readTxt.replace(namePattern, "talkeyちゃん");
            apiResponseText = await getResponseofMebo(readTxt,nickname,uid);
        }else{
            console.log("a3rt");
            readTxt = readTxt.replace(namePattern, "");
            //a3rtに投げる
            apiResponseText = await getResponseofTalkAPI(readTxt);
        }

        //ボイチャに接続している場合は応答をf1ボイスにしてqueueに投げる
        if (botConnection != undefined) {
            addAudioToMapQueue(guildId, "たーきーちゃん", apiResponseText, "f1");
        }
        //応答をreplyで返す
        textChannel.send(apiResponseText);
    } else {
        // console.log("chk3");
        //名前が無ければ，ボイチャに接続しているかを確認して入力をそのままf1ボイスでqueueに追加
        //色々除去
        readTxt = textOperator(readTxt);
        if (botConnection != undefined) {
            addAudioToMapQueue(guildId, nickname, readTxt, "f1");
        }
    }
    return;
}

async function talkToBotFunc(readTxt, guildId, textChannel, botConnection, nickname,uid) {
    const namePattern = /たーきーちゃん|ターキーちゃん|たーきーくん|ターキーくん/;

    textChannel.sendTyping();
    //ボイチャに接続しているかを確認してf2ボイスにしてqueueに追加
    if (botConnection != undefined) {
        //色々除去
        const readreq = textOperator(readTxt);
        addAudioToMapQueue(guildId, nickname, readreq, "f2");
    }

    // console.log(`namechk: ${readTxt}`);
    var apiResponseText="";
    // const apiRandomizer = Math.floor(Math.random() * 100);

    // if (apiRandomizer< 30) {
        readTxt = readTxt.replace(namePattern, "talkeyちゃん");
        apiResponseText = await getResponseofMebo(readTxt,nickname,uid);
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
    
    return;
}

module.exports = {
    talkFunc,
    talkToBotFunc,
    talkToLlamaFunc
}
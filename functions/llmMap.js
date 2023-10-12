const {getResponseofTranslateAPI,getResponseofLlamaAPI} = require('../functions/talkapi.js');
const { addAudioToMapQueue } = require('../functions/audioMap.js');
//queue処理のお試し
//以下の改造
//https://zenn.dev/s7/articles/86511eb5089fb6c05599
//************************************************************************************************************************ */

const llmQueue = [];
const talkMemoryLength=3;

async function addLlamaQueue(guildId, nickname, readTxt, uid,textChannel,botConnection) {
    const startlength=llmQueue.length;
    llmQueue.push({guildId, nickname, readTxt, uid,textChannel,botConnection});
    if (startlength == 0) {
        // console.log(`llmqueue@addllamaqueue:${llmQueue}`);
        // processLlamaQueue(llmQueue);
        processELYZAQueue(llmQueue);
    }
    return;
};

async function processLlamaQueue(queue) {
    console.log("loop");
    // console.log(`llmqueue@processllamaqueue:${llmQueue}`);
    // console.log(`queue@processllamaqueue:${queue}`);
    // console.log(`queue.length@processllamaqueue:${queue.length}`);
    // console.log(`queue[0]@processllamaqueue:${queue[0]}`);
    if (!queue[0]?.readTxt || queue.length==0) {
        return;
    }else{
        console.log(queue.length);
    }

    const namePattern = /たーきーちゃん|ターキーちゃん|たーきーくん|ターキーくん/;
    queue[0].readTxt = queue[0].readTxt.replace(namePattern, "talkey-chan");
    
    console.log(`入力:${queue[0].readTxt}`);
    //英訳
    queue[0].readTxt=await getResponseofTranslateAPI(queue[0].readTxt,"ja","en");
    console.log(`入力->英訳:${queue[0].readTxt}`);

    queue[0].readTxt=queue[0].readTxt.replace(/Turkey-chan|talky-chan/gi,'talkey-chan').replace(/Turkey|talky/gi,'talkey-chan');
    console.log(`英訳->名前処理:${queue[0].readTxt}`);

    //llama
    queue[0].textChannel.sendTyping();
    queue[0].readTxt=await getResponseofLlamaAPI(queue[0].nickname,queue[0].readTxt);
    console.log(`名前処理->llm:${queue[0].readTxt}`);

    queue[0].readTxt=queue[0].readTxt.replace(/\*\S[a-z\s]*\S\*/gi,' ').replace(/\s{2,}/g,' ');
    console.log(`llm->下処理:${queue[0].readTxt}`);

    //和訳
    queue[0].readTxt=await getResponseofTranslateAPI(queue[0].readTxt,"en","ja");
    console.log(`llm->和訳:${queue[0].readTxt}`);

    queue[0].readTxt=queue[0].readTxt.replace(/トーキーちゃん/g, `talkey`);

    //音声再生にスタック
    if (queue[0].botConnection != undefined) {
        addAudioToMapQueue(queue[0].guildId, "たーきーちゃん", queue[0].readTxt.replace(/talkey/g, `たーきー`), "f1");
    }

    //該当テキストチャットにメッセージ送信
    queue[0].textChannel.send(queue[0].readTxt);

    queue.shift();
    processLlamaQueue(queue);
};

async function processELYZAQueue(queue) {
    console.log("loop");
    // console.log(`llmqueue@processllamaqueue:${llmQueue}`);
    // console.log(`queue@processllamaqueue:${queue}`);
    // console.log(`queue.length@processllamaqueue:${queue.length}`);
    // console.log(`queue[0]@processllamaqueue:${queue[0]}`);
    if (!queue[0]?.readTxt || queue.length==0) {
        return;
    }else{
        console.log(queue.length);
    }

    const namePattern = /たーきーちゃん|ターキーちゃん|たーきーくん|ターキーくん/;
    queue[0].readTxt = queue[0].readTxt.replace(namePattern, "talkeyちゃん");
    
    console.log(`入力:${queue[0].readTxt}`);

    //llama
    queue[0].textChannel.sendTyping();
    queue[0].readTxt=await getResponseofLlamaAPI(queue[0].nickname,queue[0].readTxt);
    console.log(`入力->llm:${queue[0].readTxt}`);
    queue[0].readTxt=queue[0].readTxt??"リプライの生成に失敗しました．"

    //音声再生にスタック
    if (queue[0].botConnection != undefined) {
        addAudioToMapQueue(queue[0].guildId, "たーきーちゃん", queue[0].readTxt.replace(/talkey/g, `たーきー`), "f1");
    }

    //該当テキストチャットにメッセージ送信
    queue[0].textChannel.send(queue[0].readTxt);

    queue.shift();
    processELYZAQueue(queue);
};

module.exports = {
    addLlamaQueue
}


const {getResponseofTranslateAPI,getResponseofLlamaAPI} = require('../functions/talkapi.js');
const { addAudioToMapQueue } = require('../functions/audioMap.js');
//queue処理のお試し
//以下の改造
//https://zenn.dev/s7/articles/86511eb5089fb6c05599
//************************************************************************************************************************ */

const llmQueue = [];

async function addLlamaQueue(guildId, nickname, readTxt, uid,textChannel,botConnection) {
    const startlength=llmQueue.length;
    llmQueue.push({guildId, nickname, readTxt, uid,textChannel,botConnection});
    if (startlength == 0) {
        console.log(`llmqueue@addllamaqueue:${llmQueue}`);
        processLlamaQueue(llmQueue);
    }
    return;
};

async function processLlamaQueue(queue) {
    console.log("loop");
    // console.log(`llmqueue@processllamaqueue:${llmQueue}`);
    // console.log(`queue@processllamaqueue:${queue}`);
    console.log(`queue.length@processllamaqueue:${queue.length}`);
    // console.log(`queue[0]@processllamaqueue:${queue[0]}`);
    if (!queue[0]?.readTxt || queue.length==0) {
        return;
    }else{
        console.log(queue.length);
    }
    
    //英訳
    queue[0].readTxt=await getResponseofTranslateAPI(queue[0].readTxt,"ja","en");
    // console.log(`queue[0].readTxt@1:${queue[0].readTxt}`);

    //llama
    queue[0].textChannel.sendTyping();
    queue[0].readTxt=await getResponseofLlamaAPI(queue[0].nickname,queue[0].readTxt);

    //和訳
    queue[0].readTxt=await getResponseofTranslateAPI(queue[0].readTxt,"en","ja");
    // console.log(`queue[0].readTxt@1:${queue[0].readTxt}`);

    queue[0].readTxt=queue[0].readTxt.replace(/トーキーちゃん/g, `talkey`);

    //音声再生にスタック
    if (queue[0].botConnection != undefined) {
        addAudioToMapQueue(queue[0].guildId, "たーきーちゃん", queue[0].readTxt, "f1");
    }

    //該当テキストチャットにメッセージ送信
    queue[0].textChannel.send(queue[0].readTxt);

    queue.shift();
    processLlamaQueue(queue);
};

module.exports = {
    addLlamaQueue
}


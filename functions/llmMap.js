const {getResponseofTranslateAPI,getResponseofLlamaAPI} = require('../functions/talkapi.js');
//queue処理のお試し
//以下の改造
//https://zenn.dev/s7/articles/86511eb5089fb6c05599
//************************************************************************************************************************ */

const llmQueue = new Map();

async function addLlamaQueue(guildId, nickname, readTxt, uid,textChannel,botConnection) {
    const queue = llmQueue;
    queue.push({guildId, nickname, readTxt, uid,textChannel,botConnection});
    if (queue.length == 0) {
        processLlamaQueue();
        // console.log(llmQueue);
    }
    return;
};

async function processLlamaQueue() {
    const queue = llmQueue;
    if (queue.length==0) {
        return;
    }
    
    //英訳
    queue.readTxt=getResponseofTranslateAPI(queue.readTxt,"ja","en");

    //llama

    //和訳
    queue.readTxt=getResponseofTranslateAPI(queue.readTxt,"en","ja");

    //音声再生にスタック<-botConnectionに応じた動作が必要かも

    //該当テキストチャットにメッセージ送信
    queue.textChannel.send(queue.readTxt);

    queue.shift();
    processLlamaQueue(guildId);
};

module.exports = {
    addLlamaQueue
}


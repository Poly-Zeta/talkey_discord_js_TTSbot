const {getResponseofTranslateAPI,getResponseofLlamaAPI} = require('../functions/talkapi.js');
//queue処理のお試し
//以下の改造
//https://zenn.dev/s7/articles/86511eb5089fb6c05599
//************************************************************************************************************************ */

const llmQueue = [];

async function addLlamaQueue(guildId, nickname, readTxt, uid,textChannel,botConnection) {
    llmQueue.push({guildId, nickname, readTxt, uid,textChannel,botConnection});
    if (llmQueue.length != 0) {
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
    console.log(`queue[0].readTxt@1:${queue[0].readTxt}`);
    if (queue.length==0) {
        return;
    };
    
    //英訳
    queue[0].readTxt=await getResponseofTranslateAPI(queue[0].readTxt,"ja","en");
    console.log(`queue[0].readTxt@1:${queue[0].readTxt}`);

    //llama

    //和訳
    queue[0].readTxt=await getResponseofTranslateAPI(queue[0].readTxt,"en","ja");
    console.log(`queue[0].readTxt@1:${queue[0].readTxt}`);

    //音声再生にスタック<-botConnectionに応じた動作が必要かも

    //該当テキストチャットにメッセージ送信
    queue[0].textChannel.send(queue[0].readTxt);

    queue.shift();
    processLlamaQueue(queue);
};

module.exports = {
    addLlamaQueue
}


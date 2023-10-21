const {getResponseofTranslateAPI,getResponseofLlamaAPI} = require('../functions/talkapi.js');
const { addAudioToMapQueue } = require('../functions/audioMap.js');
//queue処理のお試し
//以下の改造
//https://zenn.dev/s7/articles/86511eb5089fb6c05599
//************************************************************************************************************************ */

//会話履歴の保持
//事前にMapを作っておく
//key:llmQueue登録時のguildID，value:そこそこの件数を保持したリスト
//llmqueueが動作するとき，キーから履歴を呼び出して直近n件をピックアップ
//prompt末尾の会話履歴部分に挿入する
//デフォルトの対話は各マップの項目作成時に挿入しておく

//会話履歴のファイルIO
//起動時，生成されるMapに会話履歴を読み出す
//シャットダウン時，リブート時，定期タスクのそれぞれでファイルに履歴を書き込む

const llmQueue = [];
const talkMemoryLength=6;
const talkMemoryMaxLength=30;
const talkMemoryMap=new Map();
const defaultLog=[
    "userinput:875oasfj,2023/2/17,19:57,'お元気ですか？' \n ",
    "あなたの回答:'こんばんは！私は元気です！875oasfjさんはお元気ですか？;' \n ",
    "userinput:falken936,2022/12/28,21:40,'今日は仕事に行きたくない' \n ",
    "あなたの回答:'falken936さん、大丈夫ですか？休憩は取れていますか？;' \n ",
    "userinput:user556,2021/1/3,1:26,'お喋りしてくれてありがとうターキーちゃん。私は今から皿を洗います。応援しててね！' \n ",
    "あなたの回答:'user556さん、こちらこそありがとうございました。頑張ってくださいね！;' \n ",
];

async function addLlamaQueue(guildId, nickname, readTxt, uid,textChannel,botConnection,doMoldProcessFlg,doTalkLogResetFlg) {
    const startlength=llmQueue.length;
    llmQueue.push({guildId, nickname, readTxt, uid,textChannel,botConnection,doMoldProcessFlg,doTalkLogResetFlg});

    //当該ギルドに会話履歴が無ければ作成
    //デモ応答を登録する
    if(!talkMemoryMap.has(guildId)){
        talkMemoryMap.set(guildId,
            //このデモ応答登録は後々ファイル読み出しにした方が良い
            //そうなっていれば，ファイルIOにして記憶を引き継げる
            defaultLog
        );
    }
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
    
    if (!queue[0]?.readTxt || queue.length==0) {
        return;
    }else{
        console.log(queue.length);
    }

    console.log(`loop-logreset:${queue[0].doTalkLogResetFlg}`)
    if(queue[0].doTalkLogResetFlg){
        const guildLog=talkMemoryMap.get(queue[0].guildId);
        guildLog=defaultLog;
        console.log(talkMemoryMap.get(queue[0].guildId));
    }

    const namePattern = /たーきーちゃん|ターキーちゃん|たーきーくん|ターキーくん/;
    queue[0].readTxt = queue[0].readTxt.replace(namePattern, "talkeyちゃん");
    
    console.log(`入力:${queue[0].readTxt}`);

    //llama
    queue[0].textChannel.sendTyping();

    //prompt末尾にここまでの会話ログ(nラリー未満の場合はデモ応答を含む)を付けたす
    //応答ログに最新の入力を登録，ログからn+1(<-ここまでのn/2ラリー+今登録した1件)個の応答を引き出す
    //最新のユーザ入力の成形
    const date=new Date;
    const dateAndTime=`${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()},${date.getHours()}:${date.getMinutes()}`;
    queue[0].readTxt=`userinput:${queue[0].nickname},${dateAndTime},'${queue[0].readTxt}' \n `;
    //最新のユーザ入力をログに登録
    const guildLog=talkMemoryMap.get(queue[0].guildId);
    // console.log(`processELYZAQueue guildlog:${guildLog}`);
    guildLog.push(queue[0].readTxt);
    //ログの長さは一定で切る
    if(guildLog.length>talkMemoryMaxLength){guildLog.shift();}
    //ログからn/2回の会話往復と最新のユーザ入力を引き出して成形
    queue[0].readTxt=guildLog.slice(-1*(talkMemoryLength+1)).join("");
    // console.log(`processELYZAQueue joinedtxt:${queue[0].readTxt}`);

    // queue[0].readTxt=await getResponseofLlamaAPI(queue[0].nickname,queue[0].readTxt);
    queue[0].readTxt=await getResponseofLlamaAPI(queue[0].readTxt);
    if(queue[0].doMoldProcessFlg){
        const tmp=queue[0].readTxt.split(';');
        queue[0].readTxt=tmp[0].split(/\r\n|\n|\r/);
    }
    console.log(`入力->llm:${queue[0].readTxt}`);
    // console.log("chk!!");
    queue[0].readTxt=queue[0].readTxt??"リプライの生成に失敗しました．"
    if(queue[0].readTxt===""){queue[0].readTxt="リプライの生成に失敗しました．"}

    //該当テキストチャットにメッセージ送信
    await queue[0].textChannel.send(`${queue[0].readTxt}`);

    //llmの生成した応答をログに保存
    if(!queue[0].doMoldProcessFlg){
        const tmp=queue[0].readTxt.split(';');
        queue[0].readTxt=tmp[0].split(/\r\n|\n|\r/);
    }
    guildLog.push(`あなたの回答:'${queue[0].readTxt};' \n`);
    if(guildLog.length>talkMemoryMaxLength){guildLog.shift();}
    // console.log(guildLog.slice(0,3));

    //音声再生にスタック
    if (queue[0].botConnection != undefined) {
        const readreq = textOperator(queue[0].readTxt);
        addAudioToMapQueue(queue[0].guildId, "たーきーちゃん", readreq.replace(/talkey/g, `たーきー`), "f1");
    }

    queue.shift();
    processELYZAQueue(queue);
};

function getLLMQueueLength(){
    return llmQueue.length;
}

module.exports = {
    addLlamaQueue,
    getLLMQueueLength
}


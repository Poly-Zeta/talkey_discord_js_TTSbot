const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
var fs = require('fs');
var path = require('path');

var absolutePath = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, "../../path.json")
    )
);

var tokens = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, absolutePath.tokens)
    )
);

const talkAPIKey = tokens.a3rtTalk;
const summarizeAPIKey = tokens.a3rtsummarize;
const suggestAPIKey = tokens.a3rtSuggest;
const proofreadingAPIKey = tokens.a3rtProofreading;
const chaplusKey=tokens.chaplus;

async function getResponseofTalkAPI(txt) {
    // const inputTextRandomThrethold = Math.floor(Math.random() * 100);
    const input_txt = txt;

    const talkParams = new URLSearchParams();
    talkParams.append('apikey', talkAPIKey);
    talkParams.append('query', input_txt);
    const talkRes = await fetch(
        "https://api.a3rt.recruit.co.jp/talk/v1/smalltalk",
        {
            method: 'POST',
            body: talkParams
        }
    );
    const talkData = await talkRes.json();
    if (talkData.message == "ok") {
        let reply = talkData.results[0].reply;
        return reply;
    } else {
        return `リプライの生成時にエラーが発生しました．[talk]エラーコード:${talkData.status}`;
    }
}

async function getResponseofChaplus(txt,userName){
    const input_txt = txt;
    const jsonbody = {
        utterance: input_txt,
        username: userName,
        AgentState: {
            agentName: "たーきーちゃん",
            age: "15"
        },
    };
    const talkRes = await fetch(
        `https://www.chaplus.jp/v1/chat?apikey=${chaplusKey}`,
        {
            method: 'POST',
            body:    JSON.stringify(jsonbody),
            headers: { 'Content-Type': 'application/json' },
        }
    );
    const talkData = await talkRes.json();
    console.log(talkData);
    if (talkData.message == "ok") {
        let reply = talkData.bestResponse.utterance;
        return reply;
    } else {
        return `リプライの生成時にエラーが発生しました．`;
    }
}

module.exports={
    getResponseofTalkAPI,
    getResponseofChaplus
}
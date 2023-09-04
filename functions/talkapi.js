const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { Console } = require('console');
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
const meboAPIKey=tokens.meboKey;
const meboAgentId=tokens.meboId;
const translateURL=tokens.translateURLBase;
const llamaServerAddress=tokens.llamaServerAddress;
const prompt=tokens.prompt;

async function getResponseofLlamaAPI(username,txt) {
    const talkRes = await fetch(
        llamaServerAddress,
        {
            method: 'POST',
            body: JSON.stringify({
                // prompt:`${prompt}User input:[${username}]${txt}`,
                prompt:`${prompt}
                User input:${txt}
                Your output:`,
                n_predict: 512,
            })
        }
    ); 
    // console.log(talkRes);
    // console.log(talkRes.status);
    const talkData = await talkRes.json();
    // console.log(talkData);
    if(talkRes.status!=200){
        return `リプライの生成時にエラーが発生しました．`;
    }
    // console.log(talkData.content);
    // return talkData.content;
    
    const replacedRes = talkData.content.replace(/{username}/g, `${username}`);
    return replacedRes;
}

async function getResponseofTranslateAPI(txt,source,target) {
    txt=txt.replace(/ /g,"+");
    const talkRes = await fetch(
        `${translateURL}?text=${txt}&source=${source}&target=${target}`,
        {
            method: 'GET'
        }
    );
    // console.log(talkRes);
    const talkData = await talkRes.json();
    // console.log(talkData.code);
    // console.log(talkData.message);
    if (talkData.code == 200) {
        let reply = talkData.text;
        return reply;
    } else {
        return `リプライの生成時にエラーが発生しました．`;
    }
}

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
        return `リプライの生成時にエラーが発生しました．`;
    }
}

async function getResponseofChaplus(txt,userName){
    const input_txt = txt;
    const jsonbody = {
        utterance: input_txt,
        username: userName,
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
    // console.log(talkData);
    if (talkData.bestResponse.utterance != undefined) {
        let reply = talkData.bestResponse.utterance;
        return reply;
    } else {
        return `リプライの生成時にエラーが発生しました．`;
    }
}

async function getResponseofMebo(txt,userName,userId){
    const input_txt = txt;
    const jsonbody = {
        api_key:meboAPIKey,
        agent_id:meboAgentId,
        utterance: input_txt,
        uid: `discord_to_mebo_${userId}`,
        username: userName,
        agentState:{
            agentName:"talkey",
            age:"20歳"
        }
    };
    const talkRes = await fetch(
        `https://api-mebo.dev/api`,
        {
            method: 'POST',
            body:    JSON.stringify(jsonbody),
            headers: { 'Content-Type': 'application/json' },
        }
    );
    if(talkRes.ok){
        const talkData = await talkRes.json();
        // console.log(talkData);
        if (talkData.bestResponse.utterance != undefined) {
            let reply = talkData.bestResponse.utterance;
            reply = reply.replace(/うん。/g,'').replace(/。/g,'．').replace(/、/g,'，');
            return reply;
        } else {
            return `リプライの生成時にエラーが発生しました．`;
        }
    }else{
        return await getResponseofTalkAPI(input_txt);
    }
}

module.exports={
    getResponseofTalkAPI,
    getResponseofChaplus,
    getResponseofMebo,
    getResponseofTranslateAPI,
    getResponseofLlamaAPI
}
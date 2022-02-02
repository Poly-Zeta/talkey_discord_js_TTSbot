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

exports.getResponseofTalkAPI = async function (txt) {
    // console.log(txt);

    // const suggestRes = await fetch(
    //     `https://api.a3rt.recruit.co.jp/text_suggest/v2/predict?apikey=${suggestAPIKey}&previous_description=${txt}`
    // );
    // const suggestData = await suggestRes.json();
    // console.log(suggestData);
    // if (suggestData.message == "ok") {
    //     console.log(`${txt}${suggestData.suggestion[Math.floor(Math.random() * suggestData.suggestion.length)]}`)
    // }

    //text summarize apiは似た意味の文を生成する用途には向かなさそう
    // const summarizeParams = new URLSearchParams();
    // summarizeParams.append('apikey', summarizeAPIKey);
    // summarizeParams.append('sentences', `${txt}。`);
    // const summarizeRes = await fetch(
    //     "https://api.a3rt.recruit.co.jp/text_summarization/v1",
    //     {
    //         method: 'POST',
    //         body: summarizeParams
    //     }
    // );
    // const summarizeData = await summarizeRes.json();
    // console.log(summarizeData);


    const inputTextRandomThrethold = Math.floor(Math.random() * 100);
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
    const reply = talkData.results[0].reply;
    if (talkData.message == "ok") {
        const proofreadingRes = await fetch(
            `https://api.a3rt.recruit.co.jp/proofreading/v2/typo?apikey=${proofreadingAPIKey}&sentence=${reply}&sensitivity=high`
        );
        const proofreadingData = await proofreadingRes.json();
        // console.log(proofreadingData.status);
        if (proofreadingData.status === 1) {
            // console.log("proof 1");
            let proofreadingReply = reply;
            proofreadingData.alerts.forEach(element => {
                // console.log(element.word);
                proofreadingReply = proofreadingReply.slice(0, element.pos) + element.suggestions[0] + proofreadingReply.slice(element.pos + element.word.length);
            });
            // console.log(proofreadingReply);
        }
        return talkData.results[0].reply;
    } else {
        return `リプライの生成時にエラーが発生しました．エラーコード:${talkData.status}`;
    }
}
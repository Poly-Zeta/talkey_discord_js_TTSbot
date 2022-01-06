const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
var fs = require('fs');
var path = require('path');

var tokens = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, "../../tokens.json")
    )
);

const talkAPIKey = tokens.a3rtTalk;
const summarizeAPIKey = tokens.a3rtsummarize;
const suggestAPIKey = tokens.a3rtSuggest;

exports.getResponseofTalkAPI = async function (txt) {
    console.log(txt);

    const suggestRes = await fetch(
        `https://api.a3rt.recruit.co.jp/text_suggest/v2/predict?apikey=${suggestAPIKey}&previous_description=${txt}`
    );
    const suggestData = await suggestRes.json();
    console.log(suggestData);
    if (suggestData.message == "ok") {
        console.log(`${txt}${suggestData.suggestion[Math.floor(Math.random() * suggestData.suggestion.length)]}`)
    }

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
    let input_txt;

    if (inputTextRandomThrethold < 80) {
        console.log("suggest txt");
        input_txt = `${txt}${suggestData.suggestion[Math.floor(Math.random() * suggestData.suggestion.length)]}`;
    } else {
        console.log("normal txt");
        input_txt = txt;
    }

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
        return talkData.results[0].reply;
    } else {
        return `リプライの生成時にエラーが発生しました．エラーコード:${talkData.status}`;
    }
}
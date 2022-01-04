const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
var fs = require('fs');
var path = require('path');

var tokens = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, "../../tokens.json")
    )
);

const talkAPIKey = tokens.a3rtTalk;

exports.getResponseofTalkAPI = async function (txt) {
    const params = new URLSearchParams();
    params.append('apikey', talkAPIKey);
    params.append('query', txt);
    const res = await fetch(
        "https://api.a3rt.recruit.co.jp/talk/v1/smalltalk",
        {
            method: 'POST',
            body: params
        }
    );
    if (res.ok) {
        const data = await res.json();
        return data.results[0].reply;
    } else {
        console.log(res.status);
        console.log(res);
        return `リプライの生成時にエラーが発生しました．エラーコード:${res.status}`;
    }
}
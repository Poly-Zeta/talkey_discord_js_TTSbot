const twemojiRegex = require('twemoji-parser/dist/lib/regex').default;

exports.textOperator = function (txt) {
    const urlPattern = /https?:/;
    if (urlPattern.test(txt)) {
        return "";
    } else {
        txt = txt.normalize("NFKC");
        txt = txt.replace(twemojiRegex, "");
        txt = txt.replace(/<:[A-Za-z0-9]{1,}:[0-9]{19}>/g, "");
        txt = txt.replace(/[!-/:-@[-`{-~]/g, "");
        txt = txt.replace(/ヴぁ/g, 'バ').replace(/ヴァ/g, 'バ').replace(/ヴぃ/g, 'ビ').replace(/ヴィ/g, 'ビ').replace(/ヴぇ/g, 'ベ').replace(/ヴェ/g, 'ベ').replace(/ヴぉ/g, 'ボ').replace(/ヴォ/g, 'ボ').replace(/ヴ/g, "ブ");
        return txt;
    }
}
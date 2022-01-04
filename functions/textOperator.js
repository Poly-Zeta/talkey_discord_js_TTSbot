const twemojiRegex = require('twemoji-parser/dist/lib/regex').default;

exports.textOperator = function (txt) {
    const urlPattern = /https?:/;
    if (urlPattern.test(txt)) {
        return "";
    } else {
        txt = txt.normalize("NFKC");
        txt = txt.replace(twemojiRegex, "");
        txt = txt.replace(/[!-/:-@[-`{-~]/, "");
        txt = txt.replace('ヴぁ', 'バ').replace('ヴァ', 'バ').replace('ヴぃ', 'ビ').replace('ヴィ', 'ビ').replace('ヴぇ', 'ベ').replace('ヴェ', 'ベ').replace('ヴぉ', 'ボ').replace('ヴォ', 'ボ').replace("ヴ", "ブ");
        return txt;
    }
}
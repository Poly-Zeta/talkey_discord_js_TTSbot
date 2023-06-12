const { textOperator } = require('../functions/textOperator.js');
const { addAudioToMapQueue } = require('../functions/audioMap.js');
const { getVoiceConnection } = require("@discordjs/voice");
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

const formsURL=tokens.formsURLBase;

module.exports = {
    attr: "additional",
    data: {
        name: "ikanogearnotice",
        description: "ギア配信通知リストの操作",
    },
    async execute(interaction) {
        let reply = "";
        reply=`次のリンクから，通知してほしいギアの登録を行ってください．\n${formsURL}${interaction.member.id}`;
        interaction.editReply(`${interaction.member.displayName}さんがikanogearnoticeを実行しました．`);
        return interaction.followUp({content:reply,ephemeral:true});
    }
}
const { textOperator } = require('../functions/textOperator.js');
const { addAudioToMapQueue } = require('../functions/audioMap.js');
const { getVoiceConnection } = require("@discordjs/voice");
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

const formsURLBase=tokens.formsURLBase;

module.exports = {
    attr: "additional",
    data: {
        name: "ikanogearnotice",
        description: "ギア配信通知リストの操作",
        options: [
            {
                type: 3,//"STRING",
                name: "op",
                description: "操作を指定",
                choices: [
                    {
                        name: "add(ギア通知リストに新規データを登録)",
                        value: "add",
                    },
                    {
                        name: "delete(ギア通知リストからデータを削除)",
                        value: "delete",
                    }
                ],
                required: true
            }
        ]
    },
    async execute(interaction) {
        const option = interaction.options.get("op", false);
        console.log(option);
        let reply = "";

        if(option.value==="add"){
            reply=`次のGoogleFormリンクから，通知してほしいギアの登録を行ってください．\n${formsURLBase}${interaction.member.id}`;
            interaction.editReply(`${interaction.member.displayName}さんがaddを実行しました．`);
            return interaction.followUp({content:reply,ephemeral:true});
        }else{
            reply="工事中";
            return interaction.editReply(reply);
        }
    }
}
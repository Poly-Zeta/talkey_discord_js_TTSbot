const { ndnDiceRoll } = require('../functions/diceroll.js');
var fs = require('fs');
var path = require('path');

var absolutePath = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, "../../path.json")
    )
);

var weaponData = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, absolutePath.weapon)
    )
);

module.exports = {
    attr: "additional",
    data: {
        name: "ikanoweapon",
        description: "スプラ2のブキランダマイザ",
        options: [
            {
                type: "STRING",
                name: "filter",
                description: "ブキカテゴリのフィルタ",
                choices: [
                    {
                        name: "シューター",
                        value: "shooter",
                    },
                    {
                        name: "ブラスター",
                        value: "blaster",
                    },
                    {
                        name: "リールガン",
                        value: "reelgun",
                    },
                    {
                        name: "ローラー",
                        value: "roller",
                    },
                    {
                        name: "フデ",
                        value: "brush",
                    },
                    {
                        name: "チャージャー",
                        value: "charger",
                    },
                    {
                        name: "マニューバ―",
                        value: "maneuver",
                    },
                    {
                        name: "スピナー",
                        value: "splatling",
                    },
                    {
                        name: "スロッシャー",
                        value: "slosher",
                    },
                    {
                        name: "シェルター",
                        value: "brella",
                    },
                ]
            }
        ]
    },
    async execute(interaction) {
        const option = interaction.options.get("filter", false);
        let reply = "";
        if (option == null) {
            const ans = ndnDiceRoll(1, weaponData.length);
            reply = weaponData[ans].name.ja_JP;
        } else {
            var filterdWeapons = weaponData.filter(function (item, index) {
                if (item.type.key == option.value) return true;
            });
            const ans = ndnDiceRoll(1, filterdWeapons.length);
            // console.log(filterdWeapons.length);
            // console.log(ans);
            reply = `${option.value}->${filterdWeapons[ans - 1].name.ja_JP}`;
        }
        // return interaction.reply(reply);
        return interaction.editReply(reply);
    }
}
const { ndnDiceRoll } = require('../functions/diceroll.js');
var fs = require('fs');
var path = require('path');

var absolutePath = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, "../../path.json")
    )
);

var weaponData2 = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, absolutePath.weapon2)
    )
);

var weaponData3 = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, absolutePath.weapon3)
    )
);

module.exports = {
    attr: "additional",
    data: {
        name: "ikanoweapon",
        description: "スプラのブキランダマイザ",
        options: [
            {
                type: 1,//"SUB_COMMAND",
                name: "spl3",
                description: "スプラ3のブキセットから選出",
                options: [
                    {
                        type: 3,//"STRING",
                        name: "filter3",
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
                                value: "spinner",
                            },
                            {
                                name: "スロッシャー",
                                value: "slosher",
                            },
                            {
                                name: "シェルター",
                                value: "brella",
                            },
                            {
                                name: "ストリンガー",
                                value: "stringer",
                            },
                            {
                                name: "ワイパー",
                                value: "wiper",
                            },
                        ]
                    }
                ]
            },
            {
                type: 1,//"SUB_COMMAND",
                name: "spl2",
                description: "スプラ2のブキセットから選出",
                options: [
                    {
                        type: 3,//"STRING",
                        name: "filter2",
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
            }
        ]
    },
    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand(false);
        console.log(subCommand);

        if (subCommand === "spl3") {
            const option = interaction.options.get("filter3", false);
            let reply = "";
            if (option == null) {
                const ans = ndnDiceRoll(1, weaponData3.length);
                reply = weaponData3[ans-1].name.ja_JP;
            } else {
                var filterdWeapons = weaponData3.filter(function (item, index) {
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
        else if (subCommand === "spl2") {
            const option = interaction.options.get("filter2", false);
            let reply = "";
            if (option == null) {
                const ans = ndnDiceRoll(1, weaponData2.length);
                reply = weaponData2[ans-1].name.ja_JP;
            } else {
                var filterdWeapons = weaponData2.filter(function (item, index) {
                    if (item.type.key == option.value) return true;
                });
                const ans = ndnDiceRoll(1, filterdWeapons.length);
                // console.log(filterdWeapons.length);
                // console.log(ans);
                reply = `${option.value}->${filterdWeapons[ans - 1].name.ja_JP}`;
            }
            // return interaction.reply(reply);
            return interaction.editReply(reply);
        };
    }
}
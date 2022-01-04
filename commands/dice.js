const { ndnDiceRoll } = require('../functions/diceroll.js');

module.exports = {
    attr: "base",
    data: {
        name: "dice",
        description: "1D100",
        options: [
            {
                type: "STRING",
                name: "ndn",
                description: "nDnの形で入力",
                required: false,
            }
        ]
    },
    async execute(interaction) {
        const nDnPattern = /^\d{1,3}D{1}\d{1,3}$/gi;
        const nPattern = /^\d{1,3}$/gi;
        const splitDPattern = /D{1}/gi;

        const subCommand = interaction.options.getSubcommand(false);
        const ndnOption = interaction.options.get("ndn", false);
        console.log(subCommand);
        //オプション無し
        console.log(ndnOption);
        if (subCommand == null) {
            if (ndnOption == null) {
                return interaction.reply(`1D100->${ndnDiceRoll(1, 100)}`);
            } else {
                if (nDnPattern.test(ndnOption.value)) {
                    const arg = ndnOption.value.split(splitDPattern);
                    return interaction.reply(`${ndnOption.value}->${ndnDiceRoll(+arg[0], +arg[1])}`);
                } else {
                    return interaction.reply(`1D100->${ndnDiceRoll(1, 100)}`);
                }
            }
        }
        else if (subCommand == "option") {
            const first = interaction.options.get("a").value;
            const second = interaction.options.get("b").value;
            //firstが3桁の数値
            if (first.match(nPattern)) {
                //secondが3桁の数値
                if (second.match(nPattern)) {
                    return interaction.reply(`${first}D${second}->${ndnDiceRoll(first, second)}`);
                }
                //secondが3桁の数値でない
                else {
                    return interaction.reply("aまたはbの形が指定外のため，計算できませんでした．");
                }
            }
        }
        else if (subCommand == "help") {
            return interaction.reply("工事中");
        }
        else {
            return interaction.reply("エラー");
        }
    }
}
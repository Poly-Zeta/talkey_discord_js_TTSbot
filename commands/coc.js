const { MessageEmbed } = require('discord.js');
const { ndnDiceRoll } = require('../functions/diceroll.js');

module.exports = {
    attr: "additional",
    data: {
        name: "coc",
        description: "Call of Cthulhuのキャラジェネレータ"
    },
    async execute(interaction) {
        // await interaction.reply("working!");

        const STR = ndnDiceRoll(3, 6);
        const POW = ndnDiceRoll(3, 6);
        const mp = POW;
        const SAN = POW * 5;
        const DEX = ndnDiceRoll(3, 6);
        const APP = ndnDiceRoll(3, 6);
        const CON = ndnDiceRoll(3, 6);
        const SIZ = ndnDiceRoll(2, 6) + 6;
        const hp = Math.ceil((CON + SIZ) / 2);
        const INT = ndnDiceRoll(2, 6) + 6;
        const idea = INT * 5;
        const hobby = INT * 10;
        const EDU = ndnDiceRoll(3, 6) + 3;
        const job = EDU * 20;
        const knowledge = EDU * 5;
        const luck = SAN;
        const dmg_list = [
            0, 0,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            2, 2, 2, 2,
            3, 3, 3, 3, 3, 3, 3, 3,
            4, 4, 4, 4, 4, 4, 4, 4,
            5, 5, 5, 5, 5, 5, 5, 5,
            6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
            7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
            8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8
        ];
        const dmg_dict = {
            0: "error!",
            1: "-1D6",
            2: "-1D4",
            3: "0",
            4: "+1D4",
            5: "+1D6",
            6: "+2D6",
            7: "+3D6",
            8: "+4D6"
        };
        const dmg = dmg_dict[dmg_list[STR + SIZ]];
        const money_dice = ndnDiceRoll(3, 6);
        const money_dict = {
            3: "~150",
            4: "200",
            5: "250",
            6: "300",
            7: "350",
            8: "400",
            9: "450",
            10: "500",
            11: "600",
            12: "700",
            13: "800",
            14: "900",
            15: "1000",
            16: "2000",
            17: "3000",
            18: "5000~"
        };
        const MONEY = `${money_dict[money_dice]}万円`



        const embed = new MessageEmbed()
            .setTitle('status')
            .addFields(
                {
                    name: "STR(筋力)",
                    value: `${STR}`,
                    inline: true
                },
                {
                    name: "CON(頑強さ)",
                    value: `${CON}`,
                    inline: true
                },
                {
                    name: "POW(精神力)",
                    value: `${POW}`,
                    inline: true
                },
                {
                    name: "DEX(敏捷性)",
                    value: `${DEX}`,
                    inline: true
                },
                {
                    name: "APP(外見)",
                    value: `${APP}`,
                    inline: true
                },
                {
                    name: "SIZ(体格)",
                    value: `${SIZ}`,
                    inline: true
                },
                {
                    name: "INT(知力)",
                    value: `${INT}`,
                    inline: true
                },
                {
                    name: "EDU(教育)",
                    value: `${EDU}`,
                    inline: true
                },
                {
                    name: "SAN(SAN値)",
                    value: `${SAN}`,
                    inline: true
                },
                {
                    name: "幸運",
                    value: `${luck}`,
                    inline: true
                },
                {
                    name: "アイデア",
                    value: `${idea}`,
                    inline: true
                },
                {
                    name: "知識",
                    value: `${knowledge}`,
                    inline: true
                },
                {
                    name: "HP(耐久力)",
                    value: `${hp}`,
                    inline: true
                },
                {
                    name: "MP",
                    value: `${mp}`,
                    inline: true
                },
                {
                    name: "職業技能ポイント",
                    value: `${job}`,
                    inline: true
                },
                {
                    name: "趣味技能ポイント",
                    value: `${hobby}`,
                    inline: true
                },
                {
                    name: "年収",
                    value: `${MONEY}`,
                    inline: true
                },
                {
                    name: "ダメージボーナス",
                    value: `${dmg}`,
                    inline: true
                }
            )
            .setColor('#00ff00');
        await interaction.editReply("finish!");
        return await interaction.editReply({ embeds: [embed] });
    }
}
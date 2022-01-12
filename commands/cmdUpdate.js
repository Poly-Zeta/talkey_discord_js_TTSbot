const { execSync } = require('child_process');

var fs = require('fs');
var path = require('path');

var tokens = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, "../../tokens.json")
    )
);

module.exports = {
    attr: "additional",
    data: {
        name: "cmdupdate",
        description: "コマンドの更新，一斉再登録"
    },
    async execute(interaction) {
        if (interaction.member.id != tokens.PZID) {
            return interaction.reply("作者限定のコマンド");
        }
        await interaction.reply("execute register.js");

        const stdout = execSync("node .\\register.js");

        return;
    }
}
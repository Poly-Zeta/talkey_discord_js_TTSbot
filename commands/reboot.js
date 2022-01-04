
var fs = require('fs');
var path = require('path');

var statConfig = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, "../../stat.json")
    )
);

module.exports = {
    attr: "option",
    data: {
        name: "reboot",
        description: "緊急用"
    },
    async execute(interaction) {
        if (interaction.member.id == "397020822369206274") {
            statConfig.reboot += 1;
            fs.writeFileSync(
                path.resolve(__dirname, "../stat.json"),
                JSON.stringify(statConfig, undefined, 4),
                "utf-8"
            );
            return interaction.reply("再起動します");
        } else {
            return interaction.reply("作者限定のコマンド");
        }
    }
}
const { execSync, spawn } = require('child_process');

var fs = require('fs');
var path = require('path');

// var statConfig = JSON.parse(
//     fs.readFileSync(
//         path.resolve(__dirname, "../../stat.json")
//     )
// );

var tokens = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, "../../tokens.json")
    )
);

module.exports = {
    attr: "additional",
    data: {
        name: "reboot",
        description: "緊急用"
    },
    async execute(interaction) {
        if (interaction.member.id != tokens.PZID) {
            return interaction.reply("作者限定のコマンド");
        }
        *********************************************************
        // statConfig.reboot += 1;
        // fs.writeFileSync(
        //     path.resolve(__dirname, "../stat.json"),
        //     JSON.stringify(statConfig, undefined, 4),
        //     "utf-8"
        // );

        *********************************************************
        
        //これでいけるのか？？？
        const stdout = execSync("git pull origin master");

        return interaction.reply("再起動します");
    }
}

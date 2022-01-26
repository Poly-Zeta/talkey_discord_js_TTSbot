const { execSync } = require('child_process');

var fs = require('fs');
var path = require('path');

var tokens = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, "../../tokens.json")
    )
);

var statConfig = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, "../stat.json")
    )
);

module.exports = {
    attr: "additional",
    data: {
        name: "reboot",
        description: "再起動",
        options: [
            {
                type: "SUB_COMMAND",
                name: "default",
                description: "再起動",
            },
            {
                type: "SUB_COMMAND",
                name: "upgrade",
                description: "gitから最新版をpull",
            },
        ]
    },
    async execute(interaction) {
        if (interaction.member.id != tokens.PZID) {
            return interaction.reply("作者限定のコマンド");
        }
        const subCommand = interaction.options.getSubcommand(false);
        console.log(subCommand);

        await interaction.reply(`${subCommand} : 再起動します`);

        if (subCommand == "default") {
            statConfig.reboot += 1;
            //同期，上書き
            fs.writeFileSync(
                path.resolve(__dirname, "../stat.json"),
                JSON.stringify(statConfig, undefined, 4),
                "utf-8"
            );
        }

        if (subCommand == "upgrade") {
            const stdout = execSync("git pull origin master");
        }

        return;
    }
}

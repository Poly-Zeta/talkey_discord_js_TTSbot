const { execSync } = require('child_process');

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

var statConfig = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, absolutePath.stat)
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
                description: "gitから最新安定版をpull",
            },
            {
                type: "SUB_COMMAND",
                name: "develop",
                description: "gitから開発版をpull",
            },
        ]
    },
    async execute(interaction) {
        console.log(tokens.errorNotifyChannel);
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
                path.resolve(__dirname, absolutePath.stat),
                JSON.stringify(statConfig, undefined, 4),
                "utf-8"
            );
        }

        //更新後にエラー吐いたとき用に，現在動いているコードのコミットのhashを保存する．
        if (subCommand == "upgrade") {
            console.log("upgrade");
            tokens.oldRepository=tokens.nowRepository;
            fs.writeFileSync(
                path.resolve(__dirname, absolutePath.tokens),
                JSON.stringify(tokens, undefined, 4),
                "utf-8"
            );
            const stdout = execSync("git pull origin master");
        }

        //更新後にエラー吐いたとき用に，現在動いているコードのコミットのhashを保存する．
        console.log("a");
        console.log(tokens.errorNotifyChannel);
        
        if (subCommand == "develop") {
            console.log("develop");
            console.log("b");
            console.log(tokens.errorNotifyChannel);
            tokens.oldRepository=tokens.nowRepository;
            console.log("c");
            console.log(tokens.errorNotifyChannel);
            fs.writeFileSync(
                path.resolve(__dirname, absolutePath.tokens),
                JSON.stringify(tokens, undefined, 4),
                "utf-8"
            );
            console.log("d");
            console.log(tokens.errorNotifyChannel);
            const stdout = execSync("git pull origin develop:master");
        }

        return;
    }
}

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
                type: 1,//"SUB_COMMAND",
                name: "default",
                description: "再起動",
            },
            {
                type: 1,//"SUB_COMMAND",
                name: "upgrade",
                description: "gitから最新安定版をpull",
            },
            {
                type: 1,//"SUB_COMMAND",
                name: "develop",
                description: "gitから開発版をpull",
            },
        ]
    },
    async execute(interaction) {
        // console.log(tokens.errorNotifyChannel);
        if (interaction.member.id != tokens.PZID) {
            // return interaction.reply("作者限定のコマンド");
            return interaction.editReply("作者限定のコマンド");
        }
        const subCommand = interaction.options.getSubcommand(false);
        console.log(subCommand);

        // await interaction.reply(`${subCommand} : 再起動します`);
        await interaction.editReply(`${subCommand} : 再起動します`);

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
        tokens.oldRepository=tokens.nowRepository;
        fs.writeFileSync(
            path.resolve(__dirname, absolutePath.tokens),
            JSON.stringify(tokens, undefined, 4),
            "utf-8"
        );

        var branchName;
        if (subCommand == "upgrade") {
            console.log("upgrade");
            branchName="master";
        }else if (subCommand == "develop") {
            console.log("develop");
            branchName="develop";
        }
        const stdout = execSync(`git fetch origin ${branchName}`);
        const stdout2=execSync(`git reset --hard origin/${branchName}`);

        return;
    }
}

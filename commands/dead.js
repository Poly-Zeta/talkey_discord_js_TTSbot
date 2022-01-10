const { execSync, spawn } = require('child_process');

module.exports = {
    attr: "additional",
    data: {
        name: "dead",
        description: "某AAを表示する",
        options: [
            {
                type: "SUB_COMMAND",
                name: "default",
                description: "突然の死",
            },
            {
                type: "SUB_COMMAND",
                name: "insert",
                description: "表示する内容を一部差し換える",
                options: [
                    {
                        type: "STRING",
                        name: "text",
                        description: "差し替え先",
                        required: true
                    }
                ]
            },
        ]
    },
    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand(false);
        console.log(subCommand);
        if (subCommand == "default") {
            const stdout = execSync('echo-sd 突然の死');
            const reply = stdout.toString();
            return interaction.reply(reply);
        } else if (subCommand == "insert") {
            const stdout = execSync(`echo-sd ${interaction.options.get("text").value}`);
            const reply = stdout.toString();
            return interaction.reply(reply);
        } else {
            return interaction.reply("エラー");
        }
    },
}
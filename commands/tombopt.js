module.exports = {
    attr: "additional",
    data: {
        name: "tomb",
        description: "某AAを表示する",
        options: [
            {
                type: "SUB_COMMAND",
                name: "insert",
                description: "表示する内容を一部差し換える",
                required: false,
                options: [
                    {
                        type: "STRING",
                        name: "text",
                        description: "差し替え先",
                        required: true
                    }
                ]
            },
            {
                type: "SUB_COMMAND",
                name: "help",
                description: "コマンドのヘルプ",
                required: false
            }
        ]
    },
    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand(false);
        console.log(subCommand);
        if (subCommand == null) {
            const reply = "†┏┛墓┗┓†";
            return interaction.reply(reply);
        } else if (subCommand == "insert") {
            // console.log(interaction.options.get("text"));
            const reply = `†┏┛${interaction.options.get("text").value}┗┓†`;
            // const reply = "†┏┛墓┗┓†";
            return interaction.reply(reply);
        } else if (subCommand == "help") {
            return interaction.reply("工事中");
        } else {
            return interaction.reply("エラー");
        }
    }
}
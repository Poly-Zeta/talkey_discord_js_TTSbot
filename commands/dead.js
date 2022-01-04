const { execSync, spawn } = require('child_process');

module.exports = {
    attr: "base",
    data: {
        name: "dead",
        description: "某AAを表示する",
    },
    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand(false);
        console.log(subCommand);
        if (subCommand == null) {
            const stdout = execSync('echo-sd 突然の死');
            const reply = stdout.toString();
            return interaction.reply(reply);
        } else if (subCommand == "insert") {
            const stdout = execSync(`echo-sd ${interaction.options.get("text").value}`);
            const reply = stdout.toString();
            return interaction.reply(reply);
        } else if (subCommand == "help") {
            return interaction.reply("工事中");
        } else {
            return interaction.reply("エラー");
        }
    },
}
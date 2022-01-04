module.exports = {
    attr: "base",
    data: {
        name: "tomb",
        description: "某AAを表示する"
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
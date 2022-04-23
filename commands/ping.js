module.exports = {
    attr: "base",
    data: {
        name: "ping",
        description: "ぴんぽん",
    },
    async execute(interaction) {
        const now = Date.now();
        const msg = [
            "pong!",
            "",
            `gateway: ${interaction.client.ws.ping}ms`,
        ];
        await interaction.reply({ content: msg.join("\n") });
        await interaction.editReply([...msg, `往復: ${Date.now() - now}ms`].join("\n"));
        return;
    }
}
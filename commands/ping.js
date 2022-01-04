module.exports = {
    attr: "base",
    data: {
        name: "ping",
        description: "Replies with Pong!",
    },
    async execute(interaction) {
        const now = Date.now();
        const msg = [
            "pong!",
            "",
            `gateway: ${interaction.client.ws.ping}ms`,
        ];
        // await interaction.reply({ content: msg.join("\n"), ephemeral: true });
        await interaction.reply({ content: msg.join("\n"), ephemeral: false });
        await interaction.editReply([...msg, `往復: ${Date.now() - now}ms`].join("\n"));
        console.log("ping");
        return;
    }
}
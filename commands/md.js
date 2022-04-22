const { MessageEmbed } = require('discord.js');

module.exports = {
    attr: "additional",
    data: {
        name: "md",
        description: "discordで使用できるMarkDownのチートシート"
    },
    async execute(interaction) {
        const embed = new MessageEmbed()
            .setTitle('discord MarkDown')
            .addFields(
                {
                    name: "斜体",
                    value: "\*または\_で文章を囲むと_italic_(斜体)にできます．",
                    inline: false
                },
                {
                    name: "太字",
                    value: "\\**で文章を囲むと**太字**にできます．",
                    inline: false
                },
                {
                    name: "下線",
                    value: "\\__で文章を囲むと__下線__を引けます．",
                    inline: false
                },
                {
                    name: "打消し線",
                    value: "\\~~で文章を囲むと~~打消し線~~を引けます．",
                    inline: false
                },
                {
                    name: "ネタばれ隠し",
                    value: "\\||で文章を囲むと||ネタばれ||を隠せます．",
                    inline: false
                },
                {
                    name: "インラインコードブロック",
                    value: "\\`で文章を囲むと`inline code block`になります．",
                    inline: false
                },
                {
                    name: "コードブロック",
                    value: "\\```で文章を囲むと```print('code block')```になります．",
                    inline: false
                },
                {
                    name: "引用",
                    value: "文章の前に`> `または`>>> `を入力すると，>>>文章を引用できます．",
                    inline: false
                },
                {
                    name: "無効化",
                    value: "バックスラッシュの\\*\\*後\\*\\*に入力された装飾は\\_\\_無効化\\_\\_されます．",
                    inline: false
                },
            )
            .setColor('#00ff00');
        return await interaction.reply({ embeds: [embed] });

    }
}
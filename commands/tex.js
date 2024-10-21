const mathjax = require("mathjax");
const sharp = require("sharp");
const { AttachmentBuilder } = require('discord.js');

module.exports = {
    attr: "additional",
    data: {
        name: "tex",
        description: "入力された数式をpngファイルで出力",
        options: [
            {
                type:3,//"STRING",
                name:"eq",
                description: "数式(TeX)",
                required:true,
            }
        ]
    },
    async execute(interaction) {
        let readTxt = interaction.options.get("eq").value;
        let reply = `> ${readTxt}`;
        let svgStr="";

        await mathjax.init({
            loader: {load: ["input/tex", "output/svg"]}
        }).then(async (MathJax) => {
            const svg = MathJax.tex2svg(obj.str, {display: true});
            svgStr = MathJax.startup.adaptor.outerHTML(svg)
                .replace(/<mjx-container class="MathJax" jax="SVG" display="true">/, "")
                .replace(/<\/mjx-container>/, "");
        });

        const pngBuff = await sharp(svgStr)
        .toBuffer();
        // const attachment = new AttachmentBuilder('../how_to_use.png','how_to_use.png');
        // embed.setImage('attachment://how_to_use.png');
        const attachment = new AttachmentBuilder()
            // .setName("fig.png")
            .setFile(pngBuff)
        // channel.send({
        //     files: [attachment],
        //     embeds: [embed]
        // })
        
        await interaction.editReply(reply);
        return await interaction.editReply({ files: [attachment], embeds: [embed] });
    }
}
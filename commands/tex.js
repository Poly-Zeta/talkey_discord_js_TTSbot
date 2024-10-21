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
            const svg = MathJax.tex2svg(readTxt, {display: true});
            svgStr = MathJax.startup.adaptor.outerHTML(svg)
                .replace(/<mjx-container class="MathJax" jax="SVG" display="true">/, "")
                .replace(/<\/mjx-container>/, "");
        });

        const metadata = await sharp(Buffer.from(svgStr)).metadata();
        const pngBuff = await sharp(Buffer.from(svgStr))
        .negate()
        .resize(metadata.width,metadata.height)
        .toBuffer();

        const attachment = new AttachmentBuilder()
            .setFile(pngBuff)
        
        await interaction.editReply(reply);
        return await interaction.editReply({ files: [attachment]});
    }
}
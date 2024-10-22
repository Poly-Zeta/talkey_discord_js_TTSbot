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

        const MathJax=await mathjax.init(
            {
                loader: {
                    load: ["input/tex", "output/svg"]
                }
            }
        );

        try{
            const svg = await MathJax.tex2svg(` ${readTxt}`, {display: true});
            svgStr = await MathJax.startup.adaptor.outerHTML(svg)
                .replace(/<mjx-container class="MathJax" jax="SVG" display="true">/, "")
                .replace(/<\/mjx-container>/, "");
                
            let cBuf=Buffer.from(svgStr);
            
            cBuf=await sharp(cBuf)
            .extend({
                top: 1,
                right: 1,
                bottom: 1,
                left: 1,
                background: '#00000000'
            }).toBuffer();

            cBuf=await sharp(cBuf)
            .resize({
                width: 500,
                height: 300,
                fit: 'outside'
            })
            .toBuffer();

            cBuf=await sharp(cBuf).extractChannel("alpha").toBuffer();

            //反転->背景000000,文字ffffff
            // cBuf=await sharp(cBuf).negate().toBuffer();

            // cBuf=await sharp(cBuf).removeAlpha().toBuffer();

            //αを追加
            // cBuf=await sharp(cBuf).ensureAlpha().toBuffer();

            //全chの値を非αの値に指定->文字のffffffとαを共通にして，残りは0で透過
            // cBuf=await sharp(cBuf).extractChannel("red").toBuffer();

            //終了
            const pngBuff = await sharp(cBuf).toBuffer();

            const attachment = new AttachmentBuilder()
                .setFile(pngBuff)
            
            await interaction.editReply(reply);
            return await interaction.editReply({ files: [attachment]});
        }catch(e){
            return await interaction.editReply("対応していない数式が入力されました．エラーのため，コマンド実行を中断します．");
        }
    }
}
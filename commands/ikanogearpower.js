const { EmbedBuilder } = require('discord.js');

module.exports = {
    attr: "additional",
    data: {
        name: "ikanogearpower",
        description: "スプラのギアパワー表記変換ツール",
        options: [
            {
                type: 3,//"STRING",
                name: "type",
                description: "変換前のギアパワー表記",
                choices: [
                    {
                        name: "5.7(公式と同じ，小数点区切りの効果量)表記",
                        value: "effect",
                    },
                    {
                        name: "3,9(カンマ区切りの大小ギア個数)表記",
                        value: "quantity",
                    }
                ],
                required: true
            },
            {
                type: 3,//"STRING",
                name: "power",
                description: "ギアパワー",
                required: true
            }
        ]
    },
    async execute(interaction) {
        const option = interaction.options.get("type", false);
        let readTxt = interaction.options.get("power").value;
        let reply = "";

        if(readTxt.length!=3){
            reply="ギアパワーの入力は，[数値1桁 カンマまたはピリオド 数値1桁]の3文字で入力してください．"
            return interaction.editReply(reply);
        }
        const msgMatch=readTxt.match(/^[0-9][,][0-9]$|^[0-9][.][0-9]$/);
        if(msgMatch===null){
            reply="ギアパワーの入力は，[数値1桁 カンマまたはピリオド 数値1桁]の3文字で入力してください．"
            return interaction.editReply(reply);
        }

        const msgAry=readTxt.split(/[.,]/);
        console.log(`msgAry:${msgAry}`);
        gearPowerBig=parseInt(msgAry[0], 10);
        gearPowerSmall=parseInt(msgAry[1], 10);
        console.log(`big:${gearPowerBig},small:${gearPowerSmall}`);

        if(option.value=="effect"){
            let pow=gearPowerBig+gearPowerSmall*0.1;
            let big=0;
            let small=0;
            console.log(`pow:${pow},big:${big},small:${small}`);
            if(pow%10==0){
                big=pow/10;
                console.log(`pow:${pow},big:${big},small:${small}`);
            }else{
                if(pow%3==0){
                    small=pow/3;
                    console.log(`pow:${pow},big:${big},small:${small}`);
                }else{
                    if((pow%10)%3==0){
                        big=~~(pow/10);
                        small=(pow%10)/3;
                        console.log(`pow:${pow},big:${big},small:${small}`);
                    }
                    else{
                        big=-1;
                    }
                }
            }
            if(big<0){
                reply="解が見つかりませんでした．";
            }else{
                reply=`5.7表記[${readTxt}]は，3,9表記で${big},${small}です`;
            }
        }else{
            reply=`3.9表記[${readTxt}]は，5.7表記で${gearPowerBig+gearPowerSmall*0.3}です`;
        }
        return interaction.editReply(reply);
    }
}
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
        // console.log(`msgAry:${msgAry}`);
        gearPowerBig=parseInt(msgAry[0], 10);
        gearPowerSmall=parseInt(msgAry[1], 10);
        // console.log(`big:${gearPowerBig},small:${gearPowerSmall}`);

        if(option.value=="effect"){
            if(gearPowerBig*10+gearPowerSmall>57){
                reply="効果量の数値は5.7を超えないように入力してください．"
                return interaction.editReply(reply);
            }
            let pow=gearPowerBig*10+gearPowerSmall;
            let big=0;
            let small=0;
            // console.log(`pow:${pow},big:${big},small:${small}`);
            if(pow%10==0){
                if(pow/10>3){
                    big=-1;
                }else{
                    big=pow/10;
                }
                // console.log(`a:pow:${pow},big:${big},small:${small}`);
            }else{
                let i=~~(pow/10);
                let x=0;
                if(i>3){i=3;}
                for(i;i>=0;i--){
                    x=pow-i*10;
                    if(x%3==0){
                        if(x/3>9){
                            continue;
                        }else{
                            big=i;
                            small=x/3;
                            break;
                        }
                    }else if(i==0){
                        big=-1;
                    }
                }
            }



            if(big<0){
                reply=`5.7表記[${readTxt}]について，3,9表記の場合の解が見つかりませんでした．`;
            }else{
                reply=`5.7表記[${readTxt}]は，3,9表記で${big},${small}です`;
            }
        }else{
            if(gearPowerBig>3||gearPowerSmall>9){
                reply="大ギアの数値は3，小ギアの数値は9をそれぞれ超えないように入力してください．"
                return interaction.editReply(reply);
            }
            reply=`3.9表記[${readTxt}]は，5.7表記で${((gearPowerBig*10+gearPowerSmall*3)*0.1).toPrecision(2)}です`;
        }
        return interaction.editReply(reply);
    }
}
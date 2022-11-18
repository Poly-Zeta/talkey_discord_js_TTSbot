const { ndnDiceRoll } = require('../functions/diceroll.js');

module.exports = {
    attr: "additional",
    data: {
        name: "dice",
        description: "ダイスロール．引数未指定なら1D100を実行",
        options: [
            {
                type:3,//"STRING",
                name:"ndn",
                description: "nDnダイスを実行(n<1000)",
                required:false,
            },
            {
                type:5,//"BOOLIAN",
                name:"secret",
                description: "trueのとき，結果を他人には見せない(無入力の際はfalseで実行)",
                required:false,
            }
            // {
            //     type: "SUB_COMMAND",
            //     name: "1d100",
            //     description: "1D100を実行",
            // },
            // {
            //     type: "SUB_COMMAND",
            //     name: "ndn",
            //     description: "nDnを実行",
            //     options: [
            //         {
            //             type: "STRING",
            //             name: "ndn",
            //             description: "nDnあるいはndn，nは3桁以内の数値",
            //             required: true
            //         }
            //     ]
            // },
            // {
            //     type: "SUB_COMMAND",
            //     name: "option",
            //     description: "「a面ダイスをb個回す」のa,bをそれぞれ入力",
            //     options: [
            //         {
            //             type: "INTEGER",
            //             name: "a",
            //             description: "ダイスの面数(1~999)",
            //             required: true,
            //             max_value: 999,
            //             min_value: 0
            //         },
            //         {
            //             type: "INTEGER",
            //             name: "b",
            //             description: "ダイスの個数(1~999)",
            //             required: true,
            //             max_value: 999,
            //             min_value: 0
            //         }
            //     ]
            // }
        ]
    },
    async execute(interaction) {
        const nDnPattern = /^\d{1,3}D{1}\d{1,3}$/gi;
        // const nPattern = /^\d{1,3}$/gi;
        const splitDPattern = /D{1}/gi;

        // const subCommand = interaction.options.getSubcommand(false);
        // console.log(subCommand);

        const cmdOption=interaction.options.get("ndn",false);
        let ndn;
        if(cmdOption!==null){
            ndn=cmdOption.value;
            console.log(`ndn:${ndn}`);
        }else{
            ndn="1D100";
            console.log(`ndn(default):${ndn}`);
        }

        let replyText=""
        if (nDnPattern.test(ndn)) {
            const arg = ndn.split(splitDPattern);
            // return interaction.reply(`${ndn}->${ndnDiceRoll(+arg[0], +arg[1])}`);
            // return interaction.editReply(`${ndn}->${ndnDiceRoll(+arg[0], +arg[1])}`);
            replyText=`${ndn}->${ndnDiceRoll(+arg[0], +arg[1])}`;
        } else {
            // return interaction.reply(`引数が指定の形式に一致していないため，1D100を実行しました．\n1D100->${ndnDiceRoll(1, 100)}`);
            // return interaction.editReply(`引数が指定の形式に一致していないため，1D100を実行しました．\n1D100->${ndnDiceRoll(1, 100)}`);
            replyText=`引数が指定の形式に一致していないため，1D100を実行しました．\n1D100->${ndnDiceRoll(1, 100)}`;
        }

        //リプライ隠し
        const shouldPublishingReply=interaction.options.get("secret",false);
        let shouldPublishingReplyFlg=false;
        if(shouldPublishingReply!==null){
            shouldPublishingReplyFlg=shouldPublishingReply.value;
            console.log(`secret:${shouldPublishingReplyFlg}`);
        }
        if(shouldPublishingReplyFlg==false){
            //普通に返信
            return interaction.editReply(replyText);
        }else{
            //何のコマンドでも自動返信している待機メッセをeditReplyで編集することで返信しているので
            //返信隠しをするついでにダイスロールが実行されたことは表示する形にしてみる
            interaction.editReply(`${interaction.member.displayName}さんが${ndn}を実行しました．`);
            return interaction.followUp({content:replyText,ephemeral:true});
        }

        //オプション無し
        // if (subCommand == "1d100") {
        //     return interaction.reply(`1D100->${ndnDiceRoll(1, 100)}`);
        // } if (subCommand == "ndn") {
        //     const ndn = interaction.options.get("ndn").value;
        //     if (nDnPattern.test(ndn)) {
        //         const arg = ndn.split(splitDPattern);
        //         return interaction.reply(`${ndn}->${ndnDiceRoll(+arg[0], +arg[1])}`);
        //     } else {
        //         return interaction.reply(`引数が指定の形式に一致していないため，1D100を実行しました．\n1D100->${ndnDiceRoll(1, 100)}`);
        //     }
        // } else if (subCommand == "option") {
        //     const first = interaction.options.get("a").value;
        //     const second = interaction.options.get("b").value;
        //     return interaction.reply(`${first}D${second}->${ndnDiceRoll(first, second)}`);
        // } else {
        //     return interaction.reply("エラー");
        // }
    }
}
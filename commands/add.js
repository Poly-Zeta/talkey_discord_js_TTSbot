const { execSync } = require('child_process');
var fs = require('fs');
var path = require('path');

//どのコマンドをどの鯖に登録するかのデータ取得
var registerSet = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, "../../commands.json")
    )
);

//コマンド自体の引数や処理部分について書いてあるファイル群の取得
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith('.js'));
console.log(commandFiles);

//addコマンドの引数に取れるコマンドのリストを作成する
//具体的にはコマンドのモジュール内にあるattrを参照してチェックしてるだけ
const additionalCommands = [];
for (const file of commandFiles) {
    console.log(file);
    if (file == "add.js") {
        continue;
    }
    const command = require(`../commands/${file}`);

    //除外設定
    //rebootは公式鯖限定
    //beniコマンドは完全身内ネタなので無条件に登録されたら困る
    const commandsToBeExcluded = ["reboot", "beni"];

    //attrが条件通りで，除外設定にも引っかかってないならリスイン
    if (command.attr == "additional" && !commandsToBeExcluded.includes(command.data.name)) {
        console.log("added");
        additionalCommands[additionalCommands.length] = command.data;
    }
    console.log("");
}

//最大値を低めに取っておく
//25らしいけど
const maxNumOfAdditionalCommand = 15;
let lengthOfAdditionalCommandList;
if (maxNumOfAdditionalCommand > additionalCommands.length) {
    lengthOfAdditionalCommandList = additionalCommands.length;
} else {
    lengthOfAdditionalCommandList = maxNumOfAdditionalCommand;
}

//*************************************************************************************************************************** */
//choice出来るオプションがあるコマンドは以下のようになる
//options[{type,name,choices[{name,value}]},{type,name,choices[{name,value}]},{type,name,choices[{name,value}]}]
//{type,name,choices[{name,value}]}<-この部分を自動的に作る
//例(https://scrapbox.io/discordjs-japan/スラッシュコマンドを使ってみよう)
// const hello = {
//     name: "hello",
//     description: "botがあなたに挨拶します。",
//     options: [
//         {
//             type: "STRING",
//             name: "language",
//             description: "どの言語で挨拶するか指定します。",
//             required: true,
//             choices: [
//                 {
//                     name: "English",
//                     value: "en"
//                 },
//                 {
//                     name: "Japanese",
//                     value: "ja"
//                 }
//             ],
//         }
//     ]
// };


const optionsOfChoiceObject = [];
for (let i = 0; i < lengthOfAdditionalCommandList; i = (i + 1) | 0) {
    optionsOfChoiceObject[optionsOfChoiceObject.length] = {
        name: `${additionalCommands[i].name}`,
        value: `${additionalCommands[i].name}`,
    };
}

const optionsObject = [];
for (let i = 0; i < lengthOfAdditionalCommandList; i = (i + 1) | 0) {
    optionsObject[optionsObject.length] = {
        type: "STRING",
        name: `command${i + 1}`,
        description: `追加するコマンド${i + 1}`,
        choices: optionsOfChoiceObject
    };
}

//*************************************************************************************************************************** */

module.exports = {
    attr: "option",
    data: {
        name: "add",
        description: "コマンドを追加するコマンド．",
        options: optionsObject
    },
    async execute(interaction) {
        //処理が重すぎて一番最後だとinteractionReplyが走らないので先にreplyしておく
        await interaction.reply("working!");
        if (interaction.memberPermissions.has('ADMINISTRATOR')) {

            //鯖IDを取得しておき，それをもとにcommand.jsonの該当部分を探す
            const guildID = interaction.guild.id;
            //O(N)なのか？indexが欲しいのでとりあえず放置
            const serverIndex = registerSet.findIndex((v) => v.id === guildID);

            //****************************************************************************************************************** */
            //追加コマンド(/addのオプションそのまま)のリストを，jsonのリストに直接突っ込んでから重複排除した方が速い説
            const arguments = [];
            for (let i = 0; i < lengthOfAdditionalCommandList; i = (i + 1) | 0) {

                //そもそもその引数があるかのチェック　無ければスキップ
                const interactionOpt = interaction.options.get(`command${i + 1}`, false);
                console.log(`interactionOpt:${interactionOpt}`);

                if (interactionOpt != null) {
                    console.log(`opt:${interactionOpt.value}`);
                    // console.log(`find?:${!exsistingOptions.includes(interactionOpt.value)}`);

                    arguments[arguments.length] = interactionOpt.value;
                }
            }

            //↓これで一気にできるけど，場合分けして返答したかったので却下 パフォーマンスやばくなってきたら変える手もある
            // registerSet[serverIndex].registerCommands= Array.from(new Set( registerSet[serverIndex].registerCommands.concat(addOptions) ) );

            //まず引数無しを除外
            if (arguments.length == 0) {
                return interaction.editReply("addコマンドに引数が与えられませんでした．");
            }

            //引数の被りを除外
            const argumentsNoDuplicate = Array.from(new Set(arguments));

            //既存コマンドとの被りを除外
            const addOptions = argumentsNoDuplicate.filter(d => !registerSet[serverIndex].registerCommands.includes(d));

            //この時点で追加処理をやる必要があるかチェック
            if (addOptions.length == 0) {
                return interaction.editReply("新規に追加する必要のある拡張コマンドが存在しませんでした．");
            }
            interaction.editReply(`${addOptions}コマンドを登録します．`);

            //この状態でaddoptionsとregisterSet[serverIndex].registerCommandsを連結すればいいはず
            registerSet[serverIndex].registerCommands = registerSet[serverIndex].registerCommands.concat(addOptions);

            //単に毎回FileSyncしたくなかったというのもある
            fs.writeFileSync(
                path.resolve(__dirname, "../../commands.json"),
                JSON.stringify(registerSet, undefined, 4),
                "utf-8"
            );
            if (process.platform == "linux") {
                const stdout = execSync('node register.js');
            }
            return;
        } else {
            return await interaction.editReply("addは各サーバ管理者限定のコマンドのため，実行できません");
        }
    }
}

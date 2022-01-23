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
const optionalCommands = [];
const excludedCommands = [];
for (const file of commandFiles) {
    console.log(file);
    if (file == "add.js") {
        continue;
    }
    const command = require(`../commands/${file}`);

    //attrはadditionalだが，addの候補に出したくない物の除外設定
    //rebootは公式鯖限定
    //beniコマンドは完全身内ネタなので無条件に登録されたら困る
    //これらは管理者が直接command.jsonを書き換えて登録する
    const commandsToBeExcluded = ["reboot", "beni"];

    //全サーバに自動導入させたいけど，即時反映させたいのでguildコマンドとして登録するもの(attrがoption)はここ
    if (command.attr == "option") {
        optionalCommands[optionalCommands.length] = command.data;
    }

    //attrがadditinalか？
    else if (command.attr == "additional") {
        //除外設定に引っかかってないか？
        if (!commandsToBeExcluded.includes(command.data.name)) {
            console.log("added");
            additionalCommands[additionalCommands.length] = command.data;
        } else {
            console.log("exclusion");
            excludedCommands[excludedCommands.length] = command.data;
        }
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
        if (!interaction.memberPermissions.has('ADMINISTRATOR')) {
            return interaction.editReply("addは各サーバ管理者限定のコマンドのため，実行できません");
        }

        //IOが心配になるぐらいならDBにした方がいいのかもしれない
        //shardingが必要な自体になってからでは遅いし
        interaction.reply("working!");
        registerSet = JSON.parse(
            fs.readFileSync(
                path.resolve(__dirname, "../../commands.json")
            )
        );
        //鯖IDを取得しておき，それをもとにcommand.jsonの該当部分を探す
        const guildID = interaction.guild.id;

        //****************************************************************************************************************** */
        //追加コマンド(/addのオプションそのまま)のリストを，jsonのリストに直接突っ込んでから重複排除した方が速い説

        //コマンドの引数から，追加したいコマンドの名前一覧を作る
        const arguments = [];
        for (let i = 0; i < lengthOfAdditionalCommandList; i = (i + 1) | 0) {

            //そもそもその引数があるかのチェック　無ければスキップ
            const interactionOpt = interaction.options.get(`command${i + 1}`, false);

            if (interactionOpt != null) {
                console.log(`command${i + 1}opt:${interactionOpt.value}`);
                arguments[arguments.length] = interactionOpt.value;
            }
        }

        //↓これで一気にできるけど，場合分けして返答したかったので却下 パフォーマンスやばくなってきたら変える手もある
        // registerSet[serverIndex].registerCommands= Array.from(new Set( registerSet[serverIndex].registerCommands.concat(addOptions) ) );

        //名前一覧が空の場合を除外
        if (arguments.length == 0) {
            return interaction.editReply("addコマンドに引数が与えられませんでした．");
        }

        //引数の重複している要素を排除
        const argumentsNoDuplicate = Array.from(new Set(arguments));

        //既存コマンドの一覧に書き足すため，追加したいコマンド一覧から既存コマンドと追加したいコマンドの重複を排除
        const addOptions = argumentsNoDuplicate.filter(d => !registerSet[guildID].registerCommands.includes(d));

        //この時点で追加処理をやる必要があるかチェック
        if (addOptions.length == 0) {
            return interaction.editReply("新規に追加する必要のある拡張コマンドが存在しませんでした．");
        }
        interaction.editReply(`${addOptions}コマンドを登録します．`);

        //この状態でaddoptionsとregisterSet[serverIndex].registerCommandsを連結すればいいはず
        registerSet[guildID].registerCommands = registerSet[guildID].registerCommands.concat(addOptions);

        //単に毎回FileSyncしたくなかったというのもある
        fs.writeFile(
            path.resolve(__dirname, "../../commands.json"),
            JSON.stringify(registerSet, undefined, 4),
            "utf-8"
        );
        //これで，登録すべきコマンド一覧が完成

        //optionnalCommandsはこの後連結するが，add.jsは循環参照回避のためリストに含まれていないのでここでリストに追加
        optionalCommands[optionalCommands.length] = this.data;

        //additional,excluded,optionalの連結
        //additinal+excludedからはregistersetに無いコマンドを排除
        const commandsToBeRegistlated = optionalCommands.concat(
            additionalCommands.concat(excludedCommands)
                .filter(item => registerSet[guildID].registerCommands.includes(item.name))
        );

        const commandList = Array.from(new Set(commandsToBeRegistlated));
        console.log(`add ${addOptions}`);
        return interaction.guild.commands.set(commandList);

    }
}

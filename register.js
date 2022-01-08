//slashcommandをdiscord側に登録するコード

//使うやつ
var fs = require('fs');
var path = require('path');

//botのアクセストークンをファイルから持ってくる準備
var tokens = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, "../tokens.json")
    )
);

//どのコマンドをどの鯖に登録するかのデータ取得
var registerSet = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, "../commands.json")
    )
);

//コマンド自体の引数や処理部分について書いてあるファイル群の取得
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

//準備
const { Client, ClientApplication } = require("discord.js");
const client = new Client({
    intents: 0,
});

//bot動作トークン
client.token = tokens.bot;

//******************************************************************************************** */
//登録用の関数．client,登録するコマンドのリスト，対象となる鯖IDがセット
//鯖IDがnullだとdiscord側でglobalコマンドとして登録される
async function register(client, commands, guildID) {
    // console.log(commands);
    if (guildID == null) {
        return client.application.commands.set(commands);
    }
    const guild = await client.guilds.fetch(guildID);
    // console.log(commands);
    return guild.commands.set(commands);
}
//******************************************************************************************** */

//コマンドをリスト化する
//base：globalコマンドに相当．更新に時間がかかるが全サーバに自動実装．
//optional：guildコマンドだが，baseの拡張コマンド相当．
//additional：ほとんどがaddコマンドでの追加対象．デフォではサーバに実装されていない．
const additionalCommands = [];
const optionalCommands = [];
const baseCommands = [];
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.attr == "base") {
        baseCommands[baseCommands.length] = command.data;
    } else if (command.attr == "option") {
        optionalCommands[optionalCommands.length] = command.data;
    } else if (command.attr == "additional") {
        additionalCommands[additionalCommands.length] = command.data;
    }
}


async function main() {
    console.log("REG");
    client.application = new ClientApplication(client, {});
    await client.application.fetch();

    //鯖IDをnullにしてregister->globalコマンドの登録
    await register(client, baseCommands, null);
    console.log(baseCommands);
    console.log(`global : registration succeed!`);

    //(commands.jsonに登録されている)サーバの数だけforループ
    for (let id of Object.keys(registerSet)) {

        //optional系はbaseの拡張であるため全サーバに実装する．additional系と連結して一応重複排除しておく
        // console.log(additionalCommands);
        const commandList = Array.from(
            new Set(
                optionalCommands.concat(
                    additionalCommands.filter(item => registerSet[id].registerCommands.includes(item.name))
                )
            )
        );
        // console.log(commandList);

        //guildコマンドとして登録
        await register(client, commandList, id);
        console.log(commandList);
        console.log(`${registerSet[id].name} : registration succeed!`);
    };
}
main().catch(err => console.error(err));

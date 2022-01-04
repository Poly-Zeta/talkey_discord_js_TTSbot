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
const { add } = require('nodemon/lib/rules');
const client = new Client({
    intents: 0,
});
client.token = tokens.bot;

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

const allOptionalCommands = [];
const additionalCommands = [];
const baseCommands = [];
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    // commands[file.replace(".js","")] = command;
    if (command.attr == "base") {
        baseCommands[baseCommands.length] = command.data;
    } else if (command.attr == "additional") {
        additionalCommands[additionalCommands.length] = command.data;
    } else if (command.attr == "option") {
        allOptionalCommands[allOptionalCommands.length] = command.data;
    }
}

async function main() {
    client.application = new ClientApplication(client, {});
    await client.application.fetch();

    await register(client, baseCommands, null);
    console.log(baseCommands);
    console.log(`global : registration succeed!`);

    let commandList;
    for (let i = 0; i < registerSet.length; i++) {
        commandList = additionalCommands.concat();
        for (let j = 0; j < registerSet[i].registerCommands.length; j++) {
            let pos = allOptionalCommands.findIndex((c) => c.name === registerSet[i].registerCommands[j]);
            if (pos >= 0) {
                commandList.push(allOptionalCommands[pos]);
            }
        }
        await register(client, commandList, registerSet[i].id);
        console.log(commandList);
        console.log(`${registerSet[i].name} : registration succeed!`);
    };
}
main().catch(err => console.error(err));

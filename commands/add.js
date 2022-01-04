
var fs = require('fs');
const add = require('nodemon/lib/rules/add');
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

const allOptionalCommands = [];
for (const file of commandFiles) {
    console.log(file);
    const command = require(`../commands/${file}`);
    const commandsToBeExcluded = ["reboot", "beni", "add"];
    if (command.attr == "option" && !commandsToBeExcluded.includes(command.data.name)) {
        allOptionalCommands[allOptionalCommands.length] = command.data;
    }
}

const optionalCommandsMAX = 25;
let optionalCommandslength;
if (optionalCommandsMAX > allOptionalCommands.length) {
    optionalCommandslength = allOptionalCommands.length;
} else {
    optionalCommandslength = optionalCommandsMAX;
}

const optionsChoiceObject = [];
for (let i = 0; i < optionalCommandslength; i++) {
    optionsChoiceObject[optionsChoiceObject.length] = {
        name: `${allOptionalCommands[i].name}`,
        value: `${allOptionalCommands[i].name}`,
    };
}

const optionsObject = [];
for (let i = 0; i < optionalCommandslength; i++) {
    optionsObject[optionsObject.length] = {
        type: "STRING",
        name: `command${i + 1}`,
        description: `追加するコマンド${i + 1}`,
        choices: optionsChoiceObject
    };
}

module.exports = {
    attr: "option",
    data: {
        name: "add",
        description: "コマンドを追加するコマンド．",
        options: optionsObject
    },
    async execute(interaction) {
        const guildID = interaction.guild.id;
        // console.log(guildID);
        const serverIndex = registerSet.findIndex((v) => v.id === guildID);
        // console.log(serverIndex);
        const exsistingOptions = registerSet[serverIndex].registerCommands;
        console.log(`exsist:${exsistingOptions}`)
        const addoptions = [];
        for (let i = 0; i < optionalCommandslength; i++) {
            const interactionOpt = interaction.options.get(`command${i + 1}`, false);
            console.log(`interactionOpt:${interactionOpt}`);
            if (interactionOpt != null) {
                console.log(`opt:${interactionOpt.value}`);
                console.log(`find?:${!exsistingOptions.includes(interactionOpt.value)}`);
                if (!exsistingOptions.includes(interactionOpt.value) && !addoptions.includes(interactionOpt.value)) {
                    addoptions[addoptions.length] = interactionOpt.value;
                }
            }
        }
        console.log(`addoptions:${addoptions}`);

        if (interaction.memberPermissions.has('ADMINISTRATOR')) {
            for (const opt of addoptions) {
                console.log(opt);
                registerSet[serverIndex].registerCommands.push(opt);
            }
            fs.writeFileSync(
                path.resolve(__dirname, "../../commands.json"),
                JSON.stringify(registerSet, undefined, 4),
                "utf-8"
            );
            if (process.platform == "linux") {
                const stdout = execSync('node register.js');
            }
            return interaction.reply(`${addoptions}が登録されました．`);
        } else {
            return interaction.reply("サーバ管理者限定のコマンドのため，実行できません");
        }
    }
}
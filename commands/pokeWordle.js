const { MessageEmbed } = require('discord.js');
const { parse } = require('csv-parse/sync');
var fs = require('fs');
var path = require('path');

var absolutePath = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, "../../path.json")
    )
);

const pokewordleAllStr = fs.readFileSync(path.resolve(__dirname, absolutePath.pokewordleall)).toString();
const pokewordleAllList = parse(pokewordleAllStr).flat();

const pokewordleAnsStr = fs.readFileSync(path.resolve(__dirname, absolutePath.pokewordleans)).toString();
const pokewordleAnsList = parse(pokewordleAnsStr).flat();

//ギルド別，wordleのデータ格納用
const gameMap = new Map();

const wordleMaxChkCount = 10;

//ギルド単位のゲーム進捗を取得できる
async function getGuildGame(guildId) {
    const guildMap = gameMap.get(guildId);
    if (guildMap === undefined) {
        return undefined;
    }
    return guildMap;
}

//guildId指定のギルドをMapに追加し，新規にゲームを開始する
async function addGuildToGameMap(guildId) {
    // console.log(pokewordleAnsList);
    const answerRandomizer = Math.floor(Math.random() * pokewordleAnsList.length);
    // console.log(answerRandomizer);
    // console.log(pokewordleAnsList[answerRandomizer]);
    gameMap.set(guildId, {
        answer: pokewordleAnsList[answerRandomizer],
        log: [],
    });

    const newGame = await getGuildGame(guildId);
    console.log(`new game  ID:${guildId}  answer:${newGame.answer}`);
    return;
}

//guildId指定のギルドをMapから削除する
async function deleteGuildToGameMap(guildId) {
    gameMap.delete(guildId);
    return;
}

//guildのもつ解答リストに解答を入れる
async function addGuildAnswerQueue(guildId, ans) {
    const gameData = await getGuildGame(guildId);
    gameData.log.push(ans);
    return;
}

module.exports = {
    attr: "additional",
    data: {
        name: "pokewordle",
        description: "サーバごとに1件まで，pokewordleを実行する．",
        options: [
            {
                type: "SUB_COMMAND",
                name: "config",
                description: "ゲームの開始，進行チェック，ヘルプ",
                options: [
                    {
                        type: "STRING",
                        name: "option",
                        description: "どの操作を実行するか指定",
                        required: true,
                        choices: [
                            {
                                name: "newgame",
                                value: "newgame"
                            },
                            {
                                name: "status",
                                value: "status"
                            },
                            {
                                name: "help",
                                value: "help"
                            }
                        ],
                    }
                ]
            },
            {
                type: "SUB_COMMAND",
                name: "check",
                description: "ゲーム実行中，解答を送信する",
                options: [
                    {
                        type: "STRING",
                        name: "answer",
                        description: "解答",
                        required: true
                    }
                ]
            }
        ]
    },
    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand(false);
        console.log(subCommand);
        const guildId = interaction.guild.id;
        const guildData = await getGuildGame(guildId);

        if (subCommand === "config") {
            const commandOption = interaction.options.get("option").value;
            console.log(commandOption);
            if (commandOption === "newgame") {
                await interaction.reply("working!");
                if (guildData === undefined) {
                    await addGuildToGameMap(guildId);
                    return interaction.editReply("新規ゲームを開始しました．/pokewordle checkコマンドで解答してください．");
                } else {
                    return interaction.editReply("既にゲームが開始されています．");
                }
            } else if (commandOption === "status") {
                await interaction.reply("working!");
                if (guildData === undefined) {
                    return interaction.editReply("このギルドで進行中のゲームは存在しません．");
                } else {
                    const embed = new MessageEmbed()
                        .setTitle('status')
                        .addFields(
                            {
                                name: "解答履歴",
                                value: guildData.log.join('\n'),
                                inline: false
                            }
                        )
                        .setColor('#00ff00');
                    await interaction.editReply("finish!");
                    return await interaction.editReply({ embeds: [embed] });
                }
            } else if (commandOption === "help") {
                return interaction.reply("https://ja.wikipedia.org/wiki/Wordle");
            } else {
                return interaction.reply("エラー");
            }
        }
        else if (subCommand === "check") {
            if (guildData === undefined) {
                return interaction.reply("このギルドではゲームが開始されていません．/pokewordle config newgameで開始してください．");
            }
            await interaction.reply("working!");

            const commandOption = interaction.options.get("answer").value;
            // console.log(commandOption);

            if (!pokewordleAllList.includes(commandOption)) {
                return interaction.editReply("適切な回答をを2~5文字で入力してください．");
            }

            const correctAnsSplit = guildData.answer.split("");
            const userAnsSplit = commandOption.split("");

            for (; userAnsSplit.length < 5; userAnsSplit.push("＿"));
            // console.log(userAnsSplit);

            let chkAnsList = ["⬜", "⬜", "⬜", "⬜", "⬜"];
            //⬜ 🟨 🟩
            userAnsSplit.forEach((element, index) => {
                if (correctAnsSplit.includes(element)) {
                    chkAnsList[index] = "🟨";
                }
                if (element === correctAnsSplit[index]) {
                    chkAnsList[index] = "🟩";
                }
            });

            const chkAnsStr = chkAnsList.join("");

            const replyText = `${commandOption} -> ${chkAnsStr}`;
            const registerText = `${userAnsSplit.join("")} -> ${chkAnsStr}`;
            await addGuildAnswerQueue(guildId, registerText);

            if (chkAnsStr === "🟩🟩🟩🟩🟩") {
                const counter = guildData.log.length + 1;
                const finalLog = guildData.log.join('\n');
                deleteGuildToGameMap(guildId);
                const embed = new MessageEmbed()
                    .setTitle('result')
                    .addFields(
                        {
                            name: "log",
                            value: finalLog,
                            inline: false
                        },
                        {
                            name: "message",
                            value: `${commandOption} -> 正解！ ${counter}回で成功`,
                            inline: false
                        }
                    )
                    .setColor('#00ff00');
                interaction.editReply("finish!");
                return await interaction.editReply({ embeds: [embed] });
            }

            if (guildData.log.length >= wordleMaxChkCount) {
                const failureAns = guildData.answer;
                deleteGuildToGameMap(guildId);
                return interaction.editReply(`失敗... 答えは${failureAns}でした．`);
            }

            const embed = new MessageEmbed()
                .setTitle('result')
                .addFields(
                    {
                        name: "log",
                        value: guildData.log.join('\n'),
                        inline: false
                    },
                    {
                        name: "message",
                        value: `${replyText} ${guildData.log.length}/${wordleMaxChkCount}トライ`,
                        inline: false
                    }
                )
                .setColor('#00ff00');
            interaction.editReply("finish!");
            return await interaction.editReply({ embeds: [embed] });
            // return interaction.editReply(`${replyText} ${guildData.log.length}/${wordleMaxChkCount}トライ`);
        } else {
            return interaction.reply("エラー");
        }
    }
}

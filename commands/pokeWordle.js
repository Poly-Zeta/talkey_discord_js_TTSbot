const { EmbedBuilder } = require('discord.js');
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
                name: "newgame",
                description: "ゲームの開始",
            },
            {
                type: "SUB_COMMAND",
                name: "config",
                description: "進行チェック，ヘルプ",
                options: [
                    {
                        type: "STRING",
                        name: "option",
                        description: "どの操作を実行するか指定",
                        required: true,
                        choices: [
                            // {
                            //     name: "newgame",
                            //     value: "newgame"
                            // },
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

        if (subCommand === "newgame") {
            // await interaction.reply("working!");
            if (guildData === undefined) {
                await addGuildToGameMap(guildId);
                return interaction.editReply("新規ゲームを開始しました．/pokewordle checkコマンドで解答してください．");
            } else {
                return interaction.editReply("既にゲームが開始されています．");
            }
        }else if (subCommand === "config") {
        // if (subCommand === "config") {
            const commandOption = interaction.options.get("option").value;
            console.log(commandOption);
            // if (commandOption === "newgame") {
            //     await interaction.reply("working!");
            //     if (guildData === undefined) {
            //         await addGuildToGameMap(guildId);
            //         return interaction.editReply("新規ゲームを開始しました．/pokewordle checkコマンドで解答してください．");
            //     } else {
            //         return interaction.editReply("既にゲームが開始されています．");
            //     }
            // } else if (commandOption === "status") {
            if (commandOption === "status") {
                // await interaction.reply("working!");
                if (guildData === undefined) {
                    return interaction.editReply("このギルドで進行中のゲームは存在しません．");
                } else {
                    const embed = new EmbedBuilder()
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
                // return interaction.reply("https://ja.wikipedia.org/wiki/Wordle");
                return interaction.editReply("https://ja.wikipedia.org/wiki/Wordle");
            } else {
                // return interaction.reply("エラー");
                return interaction.editReply("エラー");
            }
        }
        else if (subCommand === "check") {
            if (guildData === undefined) {
                // return interaction.reply("このギルドではゲームが開始されていません．/pokewordle config newgameで開始してください．");
                return interaction.editReply("このギルドではゲームが開始されていません．/pokewordle config newgameで開始してください．");
            }
            // await interaction.reply("working!");

            const commandOption = interaction.options.get("answer").value;
            // console.log(commandOption);

            if (!pokewordleAllList.includes(commandOption)) {
                return interaction.editReply("適切な回答を2~5文字で入力してください．");
            }

            // const sampleStr="abcaa";
            // const sampleSplit=sampleStr.split("");
            // const sampleMatrix=[];
            // sampleMatrix.push(sampleSplit);
            // const countUp=[];

            // sampleSplit.forEach((element,index)=>{
            //     //console.log(sampleSplit[index]);
            //     //console.log(sampleSplit.slice(0,index+1).join(""));
            //     countUp.push((sampleSplit.slice(0,index+1).join("").match( new RegExp(sampleSplit[index], "g" ) )).length);
            // });

            // sampleMatrix.push(countUp);
            // console.log(sampleMatrix);
            const transpose = a => a[0].map((_, c) => a.map(r => r[c]));

            //答え文字列
            const correctAns = guildData.answer;
            //答え文字列を文字単位で分割
            const correctAnsSplit = correctAns.split("");
            //分割した文字列と出現数のリストを保存する用
            const correctAnsMatrix = [];
            //分割した文字列は先に入れておく
            correctAnsMatrix.push(correctAnsSplit);
            //出現数のリスト
            const correctAnsSplitCountUp = [];
            //出現数カウント．"aabca"->[1,2,1,1,3]となる
            correctAnsSplit.forEach((element, index) => {
                correctAnsSplitCountUp.push((correctAnsSplit.slice(0, index + 1).join("").match(new RegExp(correctAnsSplit[index], "g"))).length);
            });
            //出現数リストを保管
            correctAnsMatrix.push(correctAnsSplitCountUp);
            //転置
            const correctAnsMatrixT = transpose(correctAnsMatrix);

            const userAnsSplit = commandOption.split("");
            for (; userAnsSplit.length < 5; userAnsSplit.push("＿"));
            const userAnsMatrix = [];
            userAnsMatrix.push(userAnsSplit);
            const userAnsSplitCountUp = [];
            userAnsSplit.forEach((element, index) => {
                userAnsSplitCountUp.push((userAnsSplit.slice(0, index + 1).join("").match(new RegExp(userAnsSplit[index], "g"))).length);
            });
            userAnsMatrix.push(userAnsSplitCountUp);
            const userAnsMatrixT = transpose(userAnsMatrix);


            // let chkAnsList = ["⬜", "⬜", "⬜", "⬜", "⬜"];
            const chkAnsList = [];
            //⬜ 🟨 🟩
            userAnsMatrixT.forEach((element, index) => {
                //解答n文字目=ユーザの答えn文字目？
                if (correctAnsMatrixT[index][0] === element[0]) {
                    chkAnsList.push("🟩");
                }
                //ユーザの答えと回答に同じ文字で同じ出現回数かつその文字が緑判定でない項目がある？
                else if (correctAnsMatrixT.some((cElement, cIndex) => cElement[0] === element[0] && cElement[1] === element[1] && cElement[0] !== userAnsMatrixT[cIndex][0])) {
                    chkAnsList.push("🟨");
                } else {
                    chkAnsList.push("⬜");
                }
                // if (correctAnsSplit.includes(element)) {
                //     chkAnsList[index] = "🟨";
                //     if (correctAnsSplit[index]===element) {
                //         chkAnsList[index] = "🟩";
                //     }

                // }
            });

            const chkAnsStr = chkAnsList.join("");

            const replyText = `${commandOption} -> ${chkAnsStr}`;
            const registerText = `${userAnsSplit.join("")} -> ${chkAnsStr}`;
            await addGuildAnswerQueue(guildId, registerText);

            if (chkAnsStr === "🟩🟩🟩🟩🟩") {
                const counter = guildData.log.length;
                const finalLog = guildData.log.join('\n');
                deleteGuildToGameMap(guildId);
                const embed = new EmbedBuilder()
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
                await interaction.editReply("finish!");
                return await interaction.editReply({ embeds: [embed] });
            }

            if (guildData.log.length >= wordleMaxChkCount) {
                const failureAns = guildData.answer;
                const finalLog = guildData.log.join('\n');
                deleteGuildToGameMap(guildId);
                // return interaction.editReply(`失敗... 答えは${failureAns}でした．`);
                const embed = new EmbedBuilder()
                    .setTitle('result')
                    .addFields(
                        {
                            name: "log",
                            value: finalLog,
                            inline: false
                        },
                        {
                            name: "message",
                            value: `${commandOption} -> 失敗... 答えは${failureAns}でした．`,
                            inline: false
                        }
                    )
                    .setColor('#ff0000');
                await interaction.editReply("finish!");
                return await interaction.editReply({ embeds: [embed] });
            }

            const embed = new EmbedBuilder()
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
            await interaction.editReply("finish!");
            return await interaction.editReply({ embeds: [embed] });
            // return interaction.editReply(`${replyText} ${guildData.log.length}/${wordleMaxChkCount}トライ`);
        } else {
            // return interaction.reply("エラー");
            return interaction.editReply("エラー");
        }
    }
}

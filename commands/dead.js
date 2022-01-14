const { execSync } = require('child_process');
const { textOperator } = require('../functions/textOperator.js');

module.exports = {
    attr: "additional",
    data: {
        name: "dead",
        description: "某AAを表示する",
        options: [
            {
                type: "SUB_COMMAND",
                name: "default",
                description: "突然の死",
            },
            {
                type: "SUB_COMMAND",
                name: "insert",
                description: "表示する内容を一部差し換える",
                options: [
                    {
                        type: "STRING",
                        name: "text",
                        description: "差し替え先",
                        required: true
                    }
                ]
            },
        ]
    },
    async execute(interaction) {
        const regex2Byte = /[^\x01-\x7E\xA1-\xDF]/g;
        const regex1Byte = /[\x01-\x7E\xA1-\xDF]/g;
        const subCommand = interaction.options.getSubcommand(false);
        console.log(subCommand);
        if (subCommand == "default") {
            const stdout = execSync('echo-sd 突然の死');
            const reply = stdout.toString();
            return interaction.reply(reply);
        } else if (subCommand == "insert") {
            let insertText = interaction.options.get("text").value;
            const rep1 = insertText.replace(regex2Byte, 'あ');
            const rep2 = rep1.replace(regex1Byte, 'a');
            const stdout = execSync(`echo-sd ${rep2}`);
            const reply = stdout.toString().replace(rep2, insertText);
            // const reply = stdout.toString();
            return interaction.reply(reply);
        } else {
            return interaction.reply("エラー");
        }
    },
}
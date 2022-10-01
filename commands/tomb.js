module.exports = {
    attr: "additional",
    data: {
        name: "tomb",
        description: "某AAを表示する",
        options: [
            {
                type:3,//"STRING",
                name:"insert",
                description: "表示する内容を一部差し換える",
                required:false,
            }
            // {
            //     type: "SUB_COMMAND",
            //     name: "default",
            //     description: "†┏┛墓┗┓†",
            // },
            // {
            //     type: "SUB_COMMAND",
            //     name: "insert",
            //     description: "表示する内容を一部差し換える",
            //     options: [
            //         {
            //             type: "STRING",
            //             name: "text",
            //             description: "差し替え先",
            //             required: true
            //         }
            //     ]
            // },
        ]
    },
    async execute(interaction) {
        const cmdOption=interaction.options.get("insert",false);
        let insertText;
        if(cmdOption!==null){
            insertText=cmdOption.value;
        }else{
            insertText="墓";
        }
        
        const reply = `†┏┛${insertText}┗┓†`;
        // return interaction.reply(reply);
        return interaction.editReply(reply);

        // const subCommand = interaction.options.getSubcommand(false);
        // console.log(subCommand);
        // if (subCommand == "default") {
        //     const reply = "†┏┛墓┗┓†";
        //     return interaction.reply(reply);
        // } else if (subCommand == "insert") {
        //     const reply = `†┏┛${interaction.options.get("text").value}┗┓†`;
        //     return interaction.reply(reply);
        // } else {
        //     return interaction.reply("エラー");
        // }
    }
}
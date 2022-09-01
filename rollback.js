//nodemonと連携，rebootコマンドで更新掛けた時にエラー吐いて死んだとして，
//その場合ここのコードが呼び出されることになる
//botとして起動，エラー吐いたのでロールバックする旨を送信したあとで
//git rivertで特定の(hash保存済み)commitに戻って再起動する

const { execSync } = require('child_process');
const Discord = require("discord.js");
const {
    Client,
    EmbedBuilder ,
    ActivityType,
    GatewayIntentBits: {
        Guilds,
        GuildMessages,
        MessageContent,
        GuildMembers,
        GuildWebhooks,
        GuildVoiceStates
    }
} = require("discord.js");
const client = new Discord.Client({
    intents: [
        Guilds,
        GuildMessages,
        MessageContent,
        GuildMembers,
        GuildWebhooks,
        GuildVoiceStates
    ],
});

var fs = require('fs');
var path = require('path');

var absolutePath = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, "../path.json")
    )
);

var tokens = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, absolutePath.tokens)
    )
);

var statConfig = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, absolutePath.stat)
    )
);

client.on('ready', () => {
    client.channels.cache.get(tokens.bootNotifyChannel).send('エラーによりロールバックします．')
    .catch((e) => {
        console.log(e);
    })
    .then(() => {
        console.log("rollback!");
        client.destroy();
        // const stdout = execSync(`git revert ${tokens.oldRepository} --no-edit`);
        const stdout = execSync(`git checkout ${tokens.oldRepository}`);
        
        //git利用したロールバックでコードの変更がなかった場合，nodemonが検知しないのでファイルを書き換え
        statConfig.reboot += 1;
        fs.writeFileSync(
            path.resolve(__dirname, absolutePath.stat),
            JSON.stringify(statConfig, undefined, 4),
            "utf-8"
        );
    }).then(()=>{
        process.exit(0);
    });
});

client.login(tokens.bot).catch(err => {
    console.error(err);
    process.exit(-1);
});


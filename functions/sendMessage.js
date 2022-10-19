//ここのブロックは貰い物の改造品
//参考：
//https://scrapbox.io/discordjs-japan/Webhookを使ってメッセージの発信者を任意のユーザーに見せかける
//************************************************************************************************************************ */
//webhookのキャッシュ
const cacheWebhooks = new Map();

exports.sendMessage = async function (opt, interaction) {
    //メッセージ発信者の名前とアバターURL
    const nickname = interaction.member.displayName//nickname ?? interaction.user.username;
    const avatarURL = interaction.user.displayAvatarURL({ dynamic: true });
    //Webhookの取得（なければ作成する）
    const webhook = await getWebhookInChannel(interaction.channel).catch(e => console.error(e));
    //メッセージ送信。usernameとavatarURLをメッセージ発信者のものに指定するのがミソ
    webhook.avatar=avatarURL;
    webhook.name=nickname;
    webhook.send({
        content: `${opt} : ${interaction.options.get("message").value}`,
        // username: nickname,
        // avatarURL: avatarURL,
    }).catch(e => console.error(e));
    return;
}

async function getWebhookInChannel(channel) {
    //webhookのキャッシュを自前で保持し速度向上
    const webhook = cacheWebhooks.get(channel.id) ?? await getWebhook(channel)
    return webhook;
}

async function getWebhook(channel) {
    //チャンネル内のWebhookを全て取得
    const webhooks = await channel.fetchWebhooks();
    //tokenがある（＝webhook製作者がbot自身）Webhookを取得、なければ作成する
    const webhook = webhooks?.find((v) => v.token) ?? await channel.createWebhook({name:"Talkey"});
    //キャッシュに入れて次回以降使い回す
    if (webhook) cacheWebhooks.set(channel.id, webhook);
    return webhook;
}
//************************************************************************************************************************ */

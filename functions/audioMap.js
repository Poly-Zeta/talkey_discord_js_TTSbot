const { entersState, createAudioResource, StreamType, AudioPlayerStatus } = require("@discordjs/voice");
//queue処理のお試し
//以下の改造
//https://zenn.dev/s7/articles/86511eb5089fb6c05599
//************************************************************************************************************************ */

const queueMap = new Map();

// module.exports.queueMap=queueMap;

//https://www.gesource.jp/weblog/?p=8228
const { spawn } = require('child_process');

async function addGuildToMap(guildId, voiceChannelId, connection, player) {
    queueMap.set(guildId, {
        voiceChannelId,
        speakQueue: [],
        connection,
        player
    });
    return;
}

async function deleteGuildToMap(guildId) {
    queueMap.delete(guildId);
    return;
}

async function addAudioToMapQueue(guildId, text, voiceOption) {
    const serverQueue = queueMap.get(guildId);
    const startlength = serverQueue.speakQueue.length;
    serverQueue.speakQueue.push({ text, voiceOption });
    console.log(`queue length: ${serverQueue.speakQueue.length}`);
    if (startlength == 0) {
        playGuildAudio(guildId);
    }
    return;
};

async function playGuildAudio(guildId) {
    const guildData = queueMap.get(guildId);
    if (!guildData?.speakQueue[0]) return;

    let playResource;
    if (process.platform == "linux") {
        const child = spawn(`../AquesTalkPi`, ["-p", "-v", `${guildData.speakQueue[0].voiceOption}`, `${guildData.speakQueue[0].text}`]);
        playResource = createAudioResource(
            child.stdout,
            {
                inputType: StreamType.Arbitrary
            }
        );
    } else {
        playResource = createAudioResource(
            "D:\\Users\\poly_Z\\Music\\splat10s\\batteryfull_01.wav",
            {
                inputType: StreamType.Arbitrary
            }
        );
    }

    guildData.resource = playResource;
    guildData.player.play(playResource);

    await entersState(guildData.player, AudioPlayerStatus.Playing, 10 * 1000);
    await entersState(guildData.player, AudioPlayerStatus.Idle, 24 * 60 * 60 * 1000);

    guildData.speakQueue.shift();
    console.log(`queue length: ${guildData.speakQueue.length}`);
    playGuildAudio(guildId);
};

module.exports = {
    addGuildToMap,
    deleteGuildToMap,
    addAudioToMapQueue
}

const { entersState, createAudioResource, StreamType, AudioPlayerStatus, joinVoiceChannel, getVoiceConnection } = require("@discordjs/voice");
//queue処理のお試し
//以下の改造
//https://zenn.dev/s7/articles/86511eb5089fb6c05599
//************************************************************************************************************************ */

const queueMap = new Map();

// module.exports.queueMap=queueMap;

//https://www.gesource.jp/weblog/?p=8228
const { spawn } = require('child_process');

async function getGuildMap(guildId) {
    // console.log("queueMap.keys()", queueMap.keys());
    // console.log("guildId", guildId);
    // console.log("queueMap.get(guildId)", queueMap.get(guildId));
    const guildMap = queueMap.get(guildId);
    if (guildMap === undefined) {
        return;
    }
    // console.log("guildmap", guildMap);
    // console.log("guildMap.memberId", guildMap.memberId);
    return guildMap;
}

async function addMember(guildId, newMemberId, newMemberName) {
    const serverQueue = queueMap.get(guildId);
    console.log(serverQueue.memberId);
    serverQueue.memberId[newMemberId] = { name: newMemberName };
    console.log(`add member guild:${guildId} , member:${serverQueue.memberId.size}, member:${Object.keys(serverQueue.memberId).length}`);
    return;
}

async function deleteMember(guildId, deleteMemberId) {
    const serverQueue = queueMap.get(guildId);
    delete serverQueue.memberId[deleteMemberId];
    console.log(`delete member guild:${guildId} , member:${Object.keys(serverQueue.memberId).length}`);
    return;
}

async function addGuildToMap(guildId, voiceChannelId, connection, player) {
    const beforeSize = queueMap.size;
    queueMap.set(guildId, {
        voiceChannelId,
        speakQueue: [],
        memberId: {},
        connection,
        player
    });
    console.log(queueMap.size)
    // console.log(`add ${queueMap.get(guildId)}`);
    console.log(`add before:${beforeSize}->after:${queueMap.size}`);
    return;
}

async function moveVoiceChannel(guild, guildId, oldChannel, newChannel) {
    const beforeSize = queueMap.size;
    const mapBefore = queueMap.get(guildId);
    console.log(`move before ${mapBefore.voiceChannelId}`);
    console.log("================movestart================");

    const botConnection = getVoiceConnection(guildId);
    botConnection.destroy();

    const connection = joinVoiceChannel({
        guildId: guildId,
        channelId: newChannel.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfMute: false,
    });
    const newPlayer = mapBefore.player;
    connection.subscribe(newPlayer);

    deleteGuildToMap(guildId);
    addGuildToMap(guildId, newChannel.id, connection, newPlayer);

    console.log("================moveend================");

    const mapAfter = queueMap.get(guildId);
    console.log(`move after ${mapAfter.voiceChannelId}`);
    console.log(`before:${beforeSize}->after:${queueMap.size}`);
    return;
}

async function deleteGuildToMap(guildId) {
    const beforeSize = queueMap.size;
    queueMap.delete(guildId);
    console.log(`delete before:${beforeSize}->after:${queueMap.size}`);
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
            "D:\\Users\\poly_Z\\Music\\buppigaaan.wav",
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
    addMember,
    deleteMember,
    getGuildMap,
    addGuildToMap,
    moveVoiceChannel,
    deleteGuildToMap,
    addAudioToMapQueue
}


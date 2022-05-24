const { entersState, createAudioResource, StreamType, AudioPlayerStatus, joinVoiceChannel, getVoiceConnection } = require("@discordjs/voice");
//queue処理のお試し
//以下の改造
//https://zenn.dev/s7/articles/86511eb5089fb6c05599
//************************************************************************************************************************ */

const queueMap = new Map();

//https://www.gesource.jp/weblog/?p=8228
const { spawn } = require('child_process');

async function getGuildMap(guildId) {
    const guildMap = await queueMap.get(guildId);
    if (guildMap === undefined) {
        return;
    }
    return guildMap;
}
async function addMember(guildId, newMemberId, newMemberName) {
    const serverQueue = queueMap.get(guildId);
    // console.log(serverQueue.memberId);
    const id = newMemberId;
    const name = newMemberName;
    // serverQueue.memberId.set(newMemberId, { name: newMemberName });
    serverQueue.memberId.set(id, name);
    // serverQueue.memberId[newMemberId] = newMemberName;
    // console.log(`add member guild:${guildId} , member:${serverQueue.memberId.size}`);
    // console.log(serverQueue.memberId);
    // console.log(serverQueue.memberId[newMemberId]);
    return;
}

async function deleteMember(guildId, deleteMemberId) {
    const serverQueue = queueMap.get(guildId);
    serverQueue.memberId.delete(deleteMemberId);
    // console.log(`delete member guild:${guildId} , member:${Object.keys(serverQueue.memberId).length}`);
    return;
}

async function addGuildToMap(me, guildId, textChannelId,voiceChannelId, connection, player) {
    // const beforeSize = queueMap.size;
    const timestump = Date.now();
    queueMap.set(guildId, {
        me,
        textChannelId,
        voiceChannelId,
        speakQueue: [],
        memberId: new Map(),
        connection,
        player,
        timestump
    });
    // console.log(queueMap.size)
    // console.log(`add before:${beforeSize}->after:${queueMap.size}`);
    return;
}

async function moveVoiceChannel(guild, guildId, oldVoiceChannel, newVoiceChannel) {
    // const beforeSize = queueMap.size;
    const mapBefore = queueMap.get(guildId);
    // console.log(`move before ${mapBefore.voiceChannelId}`);
    // console.log("================movestart================");

    const botConnection = getVoiceConnection(guildId);
    botConnection.destroy();

    const connection = joinVoiceChannel({
        guildId: guildId,
        channelId: newVoiceChannel.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfMute: false,
    });
    const newPlayer = mapBefore.player;
    connection.subscribe(newPlayer);
    const newme = mapBefore.me;
    const newTextChannelId=mapBefore.textChannelId;

    deleteGuildToMap(guildId);
    addGuildToMap(newme, guildId,newTextChannelId, newVoiceChannel.id, connection, newPlayer);

    // console.log("================moveend================");

    // const mapAfter = queueMap.get(guildId);
    // console.log(`move after ${mapAfter.voiceChannelId}`);
    // console.log(`before:${beforeSize}->after:${queueMap.size}`);
    return;
}

async function deleteGuildToMap(guildId) {
    // const beforeSize = queueMap.size;
    queueMap.delete(guildId);
    // console.log(`delete before:${beforeSize}->after:${queueMap.size}`);
    return;
}

async function addAudioToMapQueue(guildId, nickname, text, voiceOption) {
    const serverQueue = queueMap.get(guildId);
    const startlength = serverQueue.speakQueue.length;
    serverQueue.speakQueue.push({ nickname, text, voiceOption });
    serverQueue.timestump = Date.now();
    // console.log(`queue length: ${serverQueue.speakQueue.length}, ${serverQueue.timestump}`);
    if (startlength == 0) {
        playGuildAudio(guildId);
    }
    return;
};

function scanQueueMap(now) {
    const beforeSize = queueMap.size;
    // console.log(`auto delete before:${beforeSize}`);
    const idList = [];

    //放置の閾値 ms単位なので 1000(ms->sec)*60(sec->min)*xでx分を閾値としている
    //チェック頻度はindex.jsのclient.on内のcronで決まっている
    const threshold = 1000 * 60 * 120;

    for (let [key, value] of queueMap.entries()) {
        if (now - value.timestump > threshold) {
            idList.push(key);
        }
    };
    // console.log(`${idList.length}`);
    return idList;
}

async function playGuildAudio(guildId) {
    const guildData = queueMap.get(guildId);
    if (!guildData?.speakQueue[0]) return;
    const defaultNickname = guildData.me.displayName;

    //これオンにすると読み上げの際に名前が入力者の名前になる 実際動かすか迷う
    // await guildData.me.setNickname(guildData.speakQueue[0].nickname);

    // let playResource;
    // if (process.platform == "linux") {
    const child = spawn(`../AquesTalkPi`, ["-p", "-v", `${guildData.speakQueue[0].voiceOption}`, `${guildData.speakQueue[0].text}`]);
    const playResource = createAudioResource(
        child.stdout,
        {
            inputType: StreamType.Arbitrary
        }
    );
    // } else {
    //     playResource = createAudioResource(
    //         "D:\\Users\\poly_Z\\Music\\buppigaaan.wav",
    //         {
    //             inputType: StreamType.Arbitrary
    //         }
    //     );
    // }

    // guildData.resource = playResource;
    guildData.player.play(playResource);

    await entersState(guildData.player, AudioPlayerStatus.Playing, 10 * 1000);
    await entersState(guildData.player, AudioPlayerStatus.Idle, 2 * 60 * 1000);

    //アイコンを元に戻す
    // await guildData.me.setNickname(defaultNickname);

    guildData.speakQueue.shift();
    // console.log(`queue length: ${guildData.speakQueue.length}`);
    playGuildAudio(guildId);
};

module.exports = {
    addMember,
    deleteMember,
    getGuildMap,
    addGuildToMap,
    moveVoiceChannel,
    deleteGuildToMap,
    addAudioToMapQueue,
    scanQueueMap
}


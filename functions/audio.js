const { entersState, VoiceConnectionStatus, createAudioResource, StreamType, createAudioPlayer, AudioPlayerStatus, NoSubscriberBehavior } = require("@discordjs/voice");
//queue処理のお試し
//以下の改造
//https://zenn.dev/s7/articles/86511eb5089fb6c05599
//************************************************************************************************************************ */
let speakQueue = [];
let isPlaying = false;

// module.exports.isPlaying = isPlaying;

//https://www.gesource.jp/weblog/?p=8228
const { spawn } = require('child_process');

async function addAudioToQueue(resource, voiceChannel, voiceOption) {
    speakQueue.push(
        { resource: resource, voiceChannel: voiceChannel, voiceOption: voiceOption }
    );
    console.log(`queue length: ${speakQueue.length}`);
    if (!isPlaying) {
        playAudio();
    }
    return;
};

async function playAudio() {
    if (speakQueue.length >= 1 && !isPlaying) {
        isPlaying = true;
        if (process.platform == "linux") {
            const child = spawn(`../AquesTalkPi`, ["-p", "-v", `${speakQueue[0].voiceOption}`, `${speakQueue[0].resource}`]);
            const playResource = createAudioResource(
                child.stdout,
                {
                    inputType: StreamType.Arbitrary
                }
            );
            const player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Pause,
                },
            });
            player.play(playResource);
            const promises = [];
            promises.push(entersState(player, AudioPlayerStatus.AutoPaused, 1000 * 10));
            promises.push(entersState(speakQueue[0].voiceChannel, VoiceConnectionStatus.Ready, 1000 * 10));
            await Promise.race(promises);
            await Promise.all([...promises]);
            speakQueue[0].voiceChannel.subscribe(player);
            await entersState(player, AudioPlayerStatus.Playing, 100);
            await entersState(player, AudioPlayerStatus.Idle, 2 ** 31 - 1);
        } else {
            await wait(5000);
            console.log("skip");
        }
        speakQueue.shift();
        console.log(`queue length: ${speakQueue.length}`);
        isPlaying = false;
        playAudio();
    } else {
        isPlaying = false
        return;
    }
};

module.exports = {
    // playAudio,
    addAudioToQueue
}

const wait = async (ms) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(); // setTimeoutの第一引数の関数として簡略化できる
        }, ms)
    });
}
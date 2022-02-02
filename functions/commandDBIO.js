//ファイルIOのうちcommands.json関連のものをこのファイル内の関数で置き換え
//DB移行時に必要な関数の実装とこのファイルの書き換えだけで済むようにしたい
//現在はギルドIDにギルド名と追加コマンドのリストが紐づいているが，
//ID->名前，その他情報　のDBと ID->追加コマンド1つ　のDBにわかれる想定

//DB側の参考
//https://thr3a.hatenablog.com/entry/20200817/1597650222

var fs = require('fs');
var path = require('path');

var absolutePath = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, "../../path.json")
    )
);

function readData() {
    const data = JSON.parse(
        fs.readFileSync(
            path.resolve(__dirname, absolutePath.commands)
        )
    );
    return data;
}

function writeData(data) {
    fs.writeFile(
        path.resolve(__dirname, absolutePath.commands),
        JSON.stringify(data, undefined, 4),
        "utf-8",
        (err) => { if (err) { console.log(err); } }
    );
    return;
}

function writeDataSync(data) {
    fs.writeFileSync(
        path.resolve(__dirname, absolutePath.commands),
        JSON.stringify(data, undefined, 4),
        "utf-8"
    );
    return;
}

//特定のギルドのデータ読み出し(DBに移行予定,ギルドのデータを検索かけてjson出力)
async function readGuildData(guildId) {
    const data = await readData();
    return data[guildId];
}

//特定のギルドのデータ追加(DBに移行予定,ギルドIDと紐づけたいデータをDBに投げる)
async function addGuildData(guildId, guildName) {
    const data = await readData();
    data[guildId] = {
        "name": guildName,
        "registerCommands": []
    };
    writeData(data);
    return;
}

//特定のギルドのデータ削除(DBに移行予定,両方のDBから特定のギルドIDのデータを全消し)
async function deleteGuildData(guildId) {
    const data = await readData();
    delete data[guildId];
    writeData(data);
    return;
}

//特定のギルドのコマンドデータ読み出し(DBに移行予定,コマンド登録DB内をIDで検索かけて結果をstringのリスト化)
async function readGuildCommand(guildId) {
    const guildData = await readGuildData(guildId);
    // console.log(guildData);
    // console.log(guildData.registerCommands);
    return guildData.registerCommands;
}

//特定のギルドのコマンドデータ追加(DBに移行予定,コマンド登録DBに追記するだけ)
async function addGuildCommand(guildId, commands) {
    const data = await readData();
    data[guildId].registerCommands = data[guildId].registerCommands.concat(commands);
    writeData(data);
    return;
}

//特定のギルドのコマンドデータ削除(DBに移行したら作る,コマンド登録DB内でID,コマンド名両方一致するものがあったら消す)

module.exports = {
    readGuildData,
    addGuildData,
    deleteGuildData,
    readGuildCommand,
    addGuildCommand
}

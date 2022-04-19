const { execSync } = require('child_process');

var fs = require('fs');
var path = require('path');

var absolutePath = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, "../../path.json")
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

async function rollback(){
    console.log("called rollback function.");
    
    client.channels.cache.get(tokens.bootNotifyChannel).send('ロールバックします．');
    const stdout = execSync("git reset --hard HEAD@{1}");

    return;
};


module.exports = {
    rollback,
};

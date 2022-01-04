exports.ndnDiceRoll = function (a, b) {
    let sum = 0;
    for (let i = 0; i < a; i++) {
        sum += Math.floor((Math.random() * b) + 1);
    }
    return sum;
}
const fs = require("fs");
const stats = fs.statSync("game.zip");
const pct = (100 * stats.size) / (13 * 1024);
const color = pct < 100 ? "\x1b[32m" : "\x1b[31m";
console.log(color, `${stats.size} / ${13 * 1024} : ${pct.toFixed(2)}% `);

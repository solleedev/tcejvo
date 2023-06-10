// sifts through lojbanwords.json to make lojbangismu.json
// and lojbancmavo.json

let lojbanwords = require("./lojbanwords.json");
const fs = require("fs");

let gismu = [];
let cmavo = [];

lojbanwords.forEach((value) => {
  if (value[1] == 7) {
    gismu.push(value[0]);
  }
  if (typeof value[1] == "string") {
    cmavo.push(value[0]);
  }
});

fs.writeFileSync("./lojbangismu.json", JSON.stringify(gismu));
fs.writeFileSync("./lojbancmavo.json", JSON.stringify(cmavo));

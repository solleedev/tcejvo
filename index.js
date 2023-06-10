// "blobloblocoicoicoitsutsutsu" - sollee.eth
// ==========================
// licensed under MIT license, copyright (c) sollee.eth 2023
//

const LENGTH = 24;

// =======

const fs = require("fs");
const rafsi = require("./rafsi");
const gismu = require("./lojbangismu.json");
const words = require("./lojbanwords.json");
const cmavo = require("./lojbancmavo.json");

let gismuRafsi = [];
let filteredRafsi = [];

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
};

// only keep official gismu rafsi
rafsi.forEach((value, key) => {
  if (gismu.includes(key)) {
    gismuRafsi = [...gismuRafsi, key.slice(0, -1), ...value];
  }
});

let parsedWords = words.map((v) => {
  if (v[1] !== 7) {
    return v[0];
  } else {
    return null;
  }
});

// remove rafsi that coincide with any word (removes stuff like bu'u which is already assigned)
gismuRafsi.forEach((value, key) => {
  if (!parsedWords.includes(value)) {
    filteredRafsi = [...filteredRafsi, value];
  }
});

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function generate() {
  // randomize the rafsi list
  let randomizedRafsi = shuffleArray(filteredRafsi);

  // choose 24 rafsi + one random gismu
  if (LENGTH > 1) {
    randomizedRafsi = randomizedRafsi.slice(0, LENGTH - 1);
  }

  // pick a gismu to go last
  let last = randomItem(gismu);

  fs.writeFileSync(
    "./out/generatedUnfixed.json",
    JSON.stringify(randomizedRafsi)
  );

  let fixed = fix(randomizedRafsi, last);

  console.log(fixed.join(""));
  fs.writeFileSync("./out/generatedFixed.json", JSON.stringify(fixed));

  // classify the words as well
  let struct = randomizedRafsi.map((value) => {
    return value
      .split("")
      .map((v) => {
        if (isConsonant(v)) {
          return "C";
        } else if (v == "'") {
          return "";
        } else {
          return "V";
        }
      })
      .join("");
  });
  fs.writeFileSync("./out/generatedStruct.json", JSON.stringify(struct));
}

function isConsonant(value) {
  return [
    "p",
    "t",
    "k",
    "f",
    "c",
    "s",
    "x",
    "b",
    "d",
    "g",
    "v",
    "j",
    "z",
    "n",
    "m",
    "l",
    "r",
  ].includes(value);
}

function startsWithCmavo(str) {
  let x = cmavo.every((value) => {
    if (str.endsWith(value)) {
      console.log(value, str);
    }
    return !str.startsWith(value);
  });
  console.warn(x);
}

const unvoicedCheck = (value) =>
  ["p", "t", "k", "f", "c", "s", "x"].includes(value);
const voicedCheck = (value) => ["b", "d", "g", "v", "j", "z"].includes(value);

// fixes rafsi list
function fix(list, lastItem) {
  let fixedList = [];

  list.forEach((value, index, array) => {
    if (index == 0) {
      // first word: adjust things that look like cmavo to add a y
      if (startsWithCmavo(value) && index == 0) {
        return fixedList.push(value + "y");
      }
    }

    //  || startsWithCmavo(array[index + 1].slice(0, 1))

    // adjust 4-letter rafsi to add a y
    if (value.length == 4) {
      return fixedList.push(value + "y");
    }

    if (index < array.length - 1) {
      // must not be the same consonant
      if (
        value.slice(-1) == array[index + 1].slice(0, 1) &&
        isConsonant(value.slice(-1)) &&
        isConsonant(array[index + 1].slice(0, 1))
      ) {
        return fixedList.push(value + "y");
      }

      // voiced & unvoiced check
      if (
        (unvoicedCheck(value.slice(-1)) &&
          voicedCheck(array[index + 1].slice(0, 1))) ||
        (voicedCheck(value.slice(-1)) &&
          unvoicedCheck(array[index + 1].slice(0, 1)))
      ) {
        console.log("inc", value.slice(-1), array[index + 1].slice(0, 1));
        return fixedList.push(value + "y");
      }

      // add a y to c, j, s, z cluster
      if (
        ["c", "j", "s", "z"].includes(value.slice(-1)) &&
        ["c", "j", "s", "z"].includes(array[index + 1].slice(0, 1))
      ) {
        return fixedList.push(value + "y");
      }

      let combined = value + array[index + 1];

      // add a y to separate forbidden consonant clusters
      if (
        combined.includes("cx") ||
        combined.includes("kx") ||
        combined.includes("xc") ||
        combined.includes("xk") ||
        combined.includes("mz")
      ) {
        return fixedList.push(value + "y");
      }

      fixedList.push(value);
    }
  });

  return [...fixedList, lastItem];
}

generate();

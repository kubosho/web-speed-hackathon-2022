// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require("fs/promises");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

// eslint-disable-next-line @typescript-eslint/no-var-requires
const zenginCode = require("zengin-code");

const BASE_DIR = path.join(__dirname, "..");
const DIST_DIR = `${BASE_DIR}/dist`;

const OUTPUT_FILE = "banks.json";
const DESTINATION_FILE = `${DIST_DIR}/${OUTPUT_FILE}`;

function getBanks() {
  const bankList = Object.entries(zenginCode).map(([code, { name }]) => ({
    code,
    name,
  }));

  return bankList;
}

async function main() {
  const banks = getBanks();
  await fs.writeFile(DESTINATION_FILE, JSON.stringify(banks));
  console.log(`Wrote ${OUTPUT_FILE} to ${DESTINATION_FILE}`);
}

main();

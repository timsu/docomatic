import { writeFileSync } from "node:fs";

const phase = Number(process.argv[2]);
if (![1, 2, 3].includes(phase)) {
  console.error("usage: node scripts/set-phase.mjs <1|2|3>");
  process.exit(1);
}

writeFileSync(".config.json", JSON.stringify({ phase }, null, 2) + "\n");
console.log(`config updated: phase=${phase}`);

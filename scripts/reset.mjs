import { writeFileSync, rmSync } from "node:fs";

writeFileSync(".config.json", JSON.stringify({ phase: 1 }, null, 2) + "\n");
rmSync("index-output", { recursive: true, force: true });
console.log("reset: phase=1 and index output cleared");

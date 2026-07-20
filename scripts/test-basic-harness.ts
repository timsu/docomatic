import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const originalDirectory = process.cwd();
const testDirectory = mkdtempSync(join(tmpdir(), "docomatic-basic-test-"));

try {
  process.chdir(testDirectory);
  const { indexDocument, readIndex } = await import("../harness/basic-runtime");
  const documents = ["one", "two", "three", "four"].map((key, score) => ({
    key,
    docId: key,
    name: key,
    company: "Sample Company",
    companyId: "sample-company",
    products: [],
    updatedAt: "2025-01-01T00:00:00.000Z",
    enrichment: { score, category: "sample", version: "test" },
  }));

  await Promise.all(documents.map(indexDocument));

  const index = await readIndex();
  assert.deepEqual(Object.keys(index).sort(), documents.map(({ key }) => key).sort());
  console.log("basic harness preserves concurrent index writes");
} finally {
  process.chdir(originalDirectory);
  rmSync(testDirectory, { recursive: true, force: true });
}

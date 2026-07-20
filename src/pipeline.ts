import {
  listDocumentIds,
  fetchDocument,
  extract,
  normalize,
  enrich,
  indexDocument,
} from "../harness";

async function main() {
  const ids = await listDocumentIds();
  console.log(`found ${ids.length} documents`);

  // Your pipeline here. Each document flows through:
  //   fetchDocument -> extract -> normalize -> enrich -> indexDocument
  // (normalize returns an array: one document can produce several records)
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
